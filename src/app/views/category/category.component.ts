import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { LanguageService } from './../../services/language.service';
import { ApiService } from './../../services/api.service';
import { DeviceService } from './../../services/device.service';
import { Language, Category } from '../../models';
import { Subscription } from 'rxjs';
import { Categories } from './../../configs/categories';
import { NgxAnalytics } from 'ngx-analytics';

@Component({
  templateUrl: 'category.component.html',
  styleUrls: ['category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {
  @ViewChild('categoryPois')
  private myScrollContainer: ElementRef;
  currentLanguage: Language;
  languageSubscription: Subscription;
  pois: Object[] = [];
  categories: Category[] = [];
  currentCategoryId: Number;
  currentCategoryName: String;
  venueId: any;
  langId: any;
  kioskId: any;
  scrollTopActive: Boolean = false;
  scrollDownActive: Boolean = false;
  applyImgsByVenueId: any;
  navigationSubscription;
  imgByVenueId = {
    '12': [
      'assets/imgs/cancel.svg',
    ],
    '18': [
      'assets/imgs/yafe/cancel.svg',
    ],
    '19': [
      'assets/imgs/hagalil/cancel.svg',
    ],
    '20': [
      'assets/imgs/ziv/cancel.svg',
    ],
    '24': [
      'assets/imgs/poria/cancel.svg',
    ]
  };

  constructor(
    private ngx_analytics: NgxAnalytics,
    public ds: DeviceService,
    private _language: LanguageService,
    private _api: ApiService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    // this._route.params.subscribe(params => {
    //   this.currentCategoryId = Number(params.categoryId);
    // });

    // this.navigationSubscription = this._router.events.subscribe((evt: any) => {
    //   if (evt instanceof NavigationEnd) {
    //     console.log(evt);
    //   }
    // });
  }
  ngOnInit() {
    this.ngx_analytics.eventTrack.next({
      action: 'URL',
      properties: {
        category: 'URL of Current Page',
        label: window.location.pathname,
      },
    });
    this._route.params.subscribe(params => {
      this.currentCategoryId = Number(params.categoryId);
      localStorage.setItem('venueId', params.venueId);
      localStorage.setItem('langId', params.langId);
      this.langId = params.langId;
    });
    this.venueId = localStorage.getItem('venueId');
    this.applyImgsByVenueId = this.imgByVenueId[this.venueId];
    const HTML = document.getElementById('venue-container');
    const venueAttr = document.createAttribute('venueId');
    venueAttr.value = this.venueId;
    HTML.setAttributeNode(venueAttr);
    this.categories = Categories[this.venueId];
    this.languageSubscription = this._language.observableLanguage.subscribe(lang => this.currentLanguage = lang);
    this.currentCategoryName = this.categories.find(
      category => category.categoryId === this.currentCategoryId
    ).name;
    if (this.currentCategoryId === 2 || this.currentCategoryId === 1) {
      this._api.poiByDistance(this.currentCategoryId, this.venueId).subscribe(pois => {
        this.pois = pois;
        setTimeout(() => this.onScroll(), 100);
      });
    } else {
      this._api.poiByCategory(this.currentCategoryId, this.venueId).subscribe(pois => {
        this.pois = pois;
        setTimeout(() => this.onScroll(), 100);
      });
    }
  }

  selectPoi(poiId, poi) {
    this.ngx_analytics.eventTrack.next({
      action: 'Select poi from category screen',
      properties: {
        category: 'Poi',
        label: poi.name,
      },
    });
    const {id, name} = poi;
    localStorage.setItem('poiValues', JSON.stringify({id, name}));
    const kioskId = localStorage.getItem('kioskId');
    this._router.navigateByUrl(`/direction/${this.venueId}/${kioskId}/${poiId}/${this.langId}`);
  }

  onScroll() {
    const element = this.myScrollContainer.nativeElement;
    if (element.scrollTop !== 0) {
      this.scrollTopActive = true;
    } else {
      this.scrollTopActive = false;
    }
    if (element.scrollTop - element.scrollHeight + element.offsetHeight <= 0) {
      this.scrollDownActive = true;
    } else {
      this.scrollDownActive = false;
    }
  }

  scrollBottom() {
    this.myScrollContainer.nativeElement.scrollTop =
      this.myScrollContainer.nativeElement.scrollTop + 80;
  }
  scrollTop() {
    this.myScrollContainer.nativeElement.scrollTop =
      this.myScrollContainer.nativeElement.scrollTop - 80;
  }
  back() {
    const kioskId = localStorage.getItem('kioskId');
    console.log(kioskId);
    this.ngx_analytics.eventTrack.next({
      action: 'Click from Category screen',
      properties: {
        category: 'Back Button',
        label: `Back to Search Screen`,
      },
    });
    this._router.navigateByUrl(`/search/${this.venueId}/${kioskId}/${this.langId}`);
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
    // if (this.navigationSubscription) {
    //   this.navigationSubscription.unsubscribe();
    // }
  }
}
