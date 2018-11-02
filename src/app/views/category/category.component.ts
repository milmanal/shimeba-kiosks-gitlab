import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LanguageService } from "./../../services/language.service";
import { ApiService } from "./../../services/api.service";
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
  categories: Category[] = Categories;
  currentCategoryId: Number;
  currentCategoryName: String;

  constructor(
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
    const venueId = localStorage.getItem("venueId");
    const HTML = document.getElementById("venue-container");
    const venueAttr = document.createAttribute("venueId");
    venueAttr.value = venueId;
    HTML.setAttributeNode(venueAttr);
    this.languageSubscription = this._language.observableLanguage.subscribe(
      lang => {
        this.currentLanguage = lang;
      }
    );
    this.currentCategoryName = this.categories.find(
      category => category.categoryId === this.currentCategoryId
    ).name;
    this._api.poiByCategory(this.currentCategoryId).subscribe(poi => {
      this.pois.push(poi);
    });
  }

  selectPoi(id) {
    const kioskId = localStorage.getItem("kioskId");
    this._router.navigateByUrl(`/direction/${kioskId}/${id}`);
  }

  scrollBottom() {
    this.myScrollContainer.nativeElement.scrollTop =
      this.myScrollContainer.nativeElement.scrollTop + 80;
  }
  scrollTop() {
    this.myScrollContainer.nativeElement.scrollTop =
      this.myScrollContainer.nativeElement.scrollTop - 80;
  }
  checkScrollTop() {
    return this.myScrollContainer.nativeElement.scrollTop !== 0;
  }
  checkScrollBottom() {
    const currentScroll =
      this.myScrollContainer.nativeElement.scrollTop -
      this.myScrollContainer.nativeElement.scrollHeight +
      this.myScrollContainer.nativeElement.offsetHeight;
    return currentScroll <= 0;
  }
  back() {
    this._router.navigateByUrl("/search");
  }

  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
}
