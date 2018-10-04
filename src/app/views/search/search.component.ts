import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LanguageService } from './../../services/language.service';
import { ApiService } from './../../services/api.service';
import { Language } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})

export class SearchComponent implements OnInit, OnDestroy {
  searchValue: String = '';
  currentLanguage: Language;
  languageSubscription: Subscription;
  constructor(
    private _language: LanguageService,
    private _api: ApiService
  ) { }
  ngOnInit() {
    this.languageSubscription = this._language.observableLanguage.subscribe(lang => {
      this.currentLanguage = lang;
    })
  }
  search(ev: any) {
    if (this.searchValue.length >=2) {
      this._api.searchPoi(this.searchValue).subscribe(pois => {
        console.log(pois);
      })
    }
  }
  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
}
