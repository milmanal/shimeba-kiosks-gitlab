import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LanguageService } from './../../services/language.service';
import { Language } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})

export class SearchComponent implements OnInit, OnDestroy {
  searchTerm : FormControl = new FormControl({ value: '', disabled: false });
  currentLanguage: Language;
  languageSubscription: Subscription;
  constructor(private _language: LanguageService) { }
  ngOnInit() {
    this.languageSubscription = this._language.observableLanguage.subscribe(lang => {
      this.currentLanguage = lang;
    })
  }
  ngOnDestroy() {
    this.languageSubscription.unsubscribe();
  }
}
