import { Component, OnInit } from '@angular/core';
import { Languages } from './../../_languages';
import { Language } from '../../models';
import { LanguageService } from './../../services/language.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DeviceService } from './../../services/device.service';
import { from } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-language-panel',
  templateUrl: './app-language-panel.component.html',
  styleUrls: ['./app-language-panel.component.scss']
})
export class AppLanguagePanelComponent implements OnInit {
  currentLanguage: Language;
  languages: Language[] = Languages;
  showAnotherLanguages: Boolean = false;
  showAllLanguages: Boolean = false;
  isRoutePage: Boolean = false;
  venueId: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _language: LanguageService,
    public ds: DeviceService
  ) {
    this._router.events.subscribe(val => {
      console.log(val);
      if (val instanceof NavigationEnd && val.url.indexOf('home') !== -1) {
        this.showAllLanguages = false;
        this.isRoutePage = false;
      }
      
      if (val instanceof NavigationEnd && val.url.indexOf('direction') !== -1) {
        this.isRoutePage = true;
      }
    });
  }

  selectLanguage(lang) {
    const replaceable = `/${this.currentLanguage.name}`;
    const url = this._router.url;
    const urlWithChangedLangId = url.replace(replaceable, `/${lang.name}`);

    console.log('this.currentLanguage.name', this.currentLanguage.name);
    console.log('lang.name', lang.name);
    console.log('this.showAnotherLanguages', this.showAnotherLanguages);

    if (this.currentLanguage.name === lang.name) {
      this.showAnotherLanguages = !this.showAnotherLanguages;
    } else {
      this.currentLanguage = lang;
      this._language.setLanguage(lang);
      this.showAnotherLanguages = !this.showAnotherLanguages;
      this.showAllLanguages = !this.showAllLanguages;

      this._router.navigateByUrl(urlWithChangedLangId);
    }
  }

  ngOnInit() {
    const venueId = localStorage.getItem('venueId');
    const HTML = document.getElementById('venue-container-language');
    const venueAttr = document.createAttribute('venueId');
    this.showAllLanguages = !this.showAllLanguages;

    if (window.location.href.includes('/home')) {
      this.showAllLanguages = true;
      // this.showAnotherLanguages = true;
    }
    venueAttr.value = venueId;
    HTML.setAttributeNode(venueAttr);
    this.currentLanguage = this._language.getCurrentLanguage();

    this._route.params.subscribe(params => {
      const sourceLangArray = from(this.languages);
      const langs = sourceLangArray.pipe(filter(lang => lang.name === params.langId));
      langs.subscribe(val => this.selectLanguage(val));
      this.showAnotherLanguages = !this.showAnotherLanguages;
    });
  }
}
