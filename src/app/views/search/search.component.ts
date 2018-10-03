import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LanguageService } from './../../services/language.service';
import { Language } from '../../models';

@Component({
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.scss']
})

export class SearchComponent implements OnInit {
  searchTerm : FormControl = new FormControl({ value: '', disabled: false });
  currentLanguage: Language;
  constructor(private _language: LanguageService) { }
  ngOnInit() {
    console.log('hello');
    this.currentLanguage = this._language.getCurrentLanguage();
  }
}
