import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Language, Category } from '../../models';

import { LanguageService } from './../../services/language.service';
import { ApiService } from './../../services/api.service';
import { DeviceService } from '../../services/device.service';

import { Subscription, timer } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import { Categories } from './../../configs/categories';
import { NgxAnalytics } from 'ngx-analytics';
import { takeUntil} from 'rxjs/operators';

import { AppRestrictModalComponent } from "../../components/restrict-modal/restrict.modal";
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss'],
  providers: [ApiService]
})

export class SearchComponent implements OnInit, OnDestroy {
  searchValue = '';
  currentLanguage: Language;
  languageSubscription: Subscription;
  searchTerm$ = new Subject<any>();
  pois: any = [];
  categories: Category[] = [];
  showMore: Boolean = false;
  venueId: any;
  langId: any;
  noSearchResult: Boolean;
  langPannelToTheBottom: Boolean = false;
  areEqual = false;
  modal: any;

  private unsubscribe$ = new Subject<void>();
  private searchActivity: Subscription;

  constructor(
    private ngx_analytics: NgxAnalytics,
    public ds: DeviceService,
    private _language: LanguageService,
    private _api: ApiService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _modalService: BsModalService,

  ) {
    this._api.search(this.searchTerm$).subscribe(results => {
      this.pois = results;
      if (this.pois['length'] === 0) {
        this.noSearchResult = true;
      } else {
        this.noSearchResult = false;
      }

      if (this.searchActivity) {
        this.searchActivity.unsubscribe();
        this.areEqual = false;
      }

      if (this.pois.length === 1 && this.doesStringsEqual(this.pois[0].name, this.searchValue)) {
        this.selectPoiAfterFewMoments(this.pois[0].id, this.pois[0]);
      }
    });
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
      localStorage.setItem('venueId', params.venueId);
      localStorage.setItem('langId', params.langId);
      localStorage.setItem('kioskId', params.kioskId);
      this.langId = params.langId;
    });
    this.venueId = localStorage.getItem('venueId');
    const HTML = document.getElementById('venue-container');
    const venueAttr = document.createAttribute('venueId');
    venueAttr.value = this.venueId;
    HTML.setAttributeNode(venueAttr);
    this.categories = Categories[this.venueId];
    this.languageSubscription = this._language.observableLanguage.subscribe(
      lang => {
        this.currentLanguage = lang;
      }
    );
  }

  doesStringsEqual(s1: string, s2: string) {
    const str1 = s1.toUpperCase().replace(/\s/g, '');
    const str2 = s2.toUpperCase().replace(/\s/g, '');
    this.areEqual = str1.length === str2.length;
    return this.areEqual;
  }

  selectPoiAfterFewMoments(poiId: number, poi, action?: string): void {
    const time = timer(3000);

    if (action && action === 'click') {
      return this.selectPoi(poiId, poi);
    }

    this.searchActivity = time
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.selectPoi(poiId, poi);
        this.ngx_analytics.eventTrack.next({
          action: 'Auto select',
          properties: {
            category: 'Poi loaded automaticaly',
            label: `Choosed destination: ${poi.name}`,
          },
        });
      });
  }

  search(ev: any) {
    if (this.searchValue.length >= 1) {
      this.searchTerm$.next({
        value: this.searchValue,
        venueId: this.venueId
      });
    } else {
      this.noSearchResult = false;
      this.pois = [];
    }

    this.ngx_analytics.eventTrack.next({
      action: 'Search',
      properties: {
        category: 'Search value',
        label: this.searchValue
      },
    });
  }

  updateSearch(e: any) {
    this.searchValue = e.target.value;
  }

  showMoreResults() {
    this.showMore = !this.showMore;
  }

  selectCategory(category) {
    this.ngx_analytics.eventTrack.next({
      action: 'Select the Category from Search screen',
      properties: {
        category: 'Category',
        label: `Clicked category: ${category.name}`,
      },
    });
    this._router.navigateByUrl(`/category/${category.categoryId}/${this.venueId}/${this.langId}`);
  }

  selectPoi(poiId, poi) {
    this.ngx_analytics.eventTrack.next({
      action: 'Select Poi by click from Search screen',
      properties: {
        category: 'Poi',
        label: `Clicked poi: ${poi.name}`,
      },
    });
    const { id, name } = poi;
    localStorage.setItem('poiValues', JSON.stringify({id, name}));
    const kioskId = localStorage.getItem('kioskId');

    this._router.navigateByUrl(`/direction/${this.venueId}/${kioskId}/${poiId}/${this.langId}`);
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
