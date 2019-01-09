import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LanguageService } from "./../../services/language.service";
import { ApiService } from "./../../services/api.service";
import { DeviceService } from "./../../services/device.service";
import { Language, Category } from "../../models";
import { Subscription } from "rxjs";
import { Categories } from "./../../configs/categories";

@Component({
  templateUrl: "category.component.html",
  styleUrls: ["category.component.scss"]
})
export class CategoryComponent implements OnInit, OnDestroy {
  @ViewChild("categoryPois")
  private myScrollContainer: ElementRef;
  currentLanguage: Language;
  languageSubscription: Subscription;
  pois: Object[] = [];
  categories: Category[] = [];
  currentCategoryId: Number;
  currentCategoryName: String;
  venueId: any;
  scrollTopActive: Boolean = false;
  scrollDownActive: Boolean = false;
  applyImgsByVenueId: any;
  imgByVenueId = {
    '12': [
      'assets/imgs/cancel.svg',
    ],
    '13': [
      'assets/imgs/yafe/cancel.svg',
    ],
    '14': [
      'assets/imgs/hagalil/cancel.svg',
    ]
  };

  constructor(
    public ds: DeviceService,
    private _language: LanguageService,
    private _api: ApiService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this._route.params.subscribe(params => {
      this.currentCategoryId = Number(params.categoryId);
    });
  }
  ngOnInit() {
    this.venueId = localStorage.getItem("venueId");
    this.applyImgsByVenueId = this.imgByVenueId[this.venueId];
    const HTML = document.getElementById("venue-container");
    const venueAttr = document.createAttribute("venueId");
    venueAttr.value = this.venueId;
    HTML.setAttributeNode(venueAttr);
    console.log(this.venueId);
    this.categories = Categories[this.venueId];
    this.languageSubscription = this._language.observableLanguage.subscribe(
      lang => {
        this.currentLanguage = lang;
      }
    );
    this.currentCategoryName = this.categories.find(
      category => category.categoryId === this.currentCategoryId
    ).name;
    if(this.currentCategoryId === 2 || this.currentCategoryId === 1) {
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

  selectPoi(id) {
    const kioskId = localStorage.getItem("kioskId");
    this._router.navigateByUrl(`/direction/${this.venueId}/${kioskId}/${id}`);
  }

  onScroll() {
    let element = this.myScrollContainer.nativeElement;
    if(element.scrollTop !== 0) {
      this.scrollTopActive = true;
    } else {
      this.scrollTopActive = false;
    }
    if(element.scrollTop - element.scrollHeight + element.offsetHeight <=0) {
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
    this._router.navigateByUrl("/search");
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
}
