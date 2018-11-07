import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";

import { LanguageService } from "./../../services/language.service";
import { ApiService } from "./../../services/api.service";
import { Language, Category } from "../../models";
import { Subscription } from "rxjs";
import { Subject } from "rxjs/Subject";
import { Categories } from "./../../configs/categories";

@Component({
  templateUrl: "search.component.html",
  styleUrls: ["search.component.scss"],
  providers: [ApiService]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchValue: string = "";
  currentLanguage: Language;
  languageSubscription: Subscription;
  searchTerm$ = new Subject<any>();
  pois: Object = [];
  categories: Category[] = Categories;
  showMore: Boolean = false;
  venueId: any;

  constructor(
    private _language: LanguageService,
    private _api: ApiService,
    private _router: Router
  ) {
    this._api.search(this.searchTerm$).subscribe(results => {
      this.pois = results;
    });
  }
  ngOnInit() {
    this.venueId = localStorage.getItem("venueId");
    const HTML = document.getElementById("venue-container");
    const venueAttr = document.createAttribute("venueId");
    venueAttr.value = this.venueId;
    HTML.setAttributeNode(venueAttr);
    this.languageSubscription = this._language.observableLanguage.subscribe(
      lang => {
        this.currentLanguage = lang;
      }
    );
  }

  search(ev: any) {
    if (this.searchValue.length >= 2) {
      this.searchTerm$.next({
        value: this.searchValue,
        venueId: this.venueId
      });
    } else {
      this.pois = [];
    }
  }
  showMoreResults() {
    this.showMore = !this.showMore;
  }
  selectCategory(id) {
    this._router.navigateByUrl(`/category/${id}`);
  }
  selectPoi(id) {
    const kioskId = localStorage.getItem("kioskId");
    this._router.navigateByUrl(`/direction/${this.venueId}/${kioskId}/${id}`);
  }
  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
}
