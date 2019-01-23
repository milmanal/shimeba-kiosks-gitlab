import { Component, OnInit } from '@angular/core';
import { Languages } from './../../_languages';
import { Language } from '../../models';
import { LanguageService } from './../../services/language.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DeviceService } from './../../services/device.service';

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
      if (val instanceof NavigationEnd && val.url.indexOf('home') !== -1) {
        this.showAllLanguages = true;
        this.isRoutePage = false;
      } else if (val instanceof NavigationEnd && val.url.indexOf('home') === -1) {
        this.showAllLanguages = false;
      }
      if (val instanceof NavigationEnd && val.url.indexOf('direction') !== -1) {
        this.isRoutePage = true;
      }
    });
  }

  selectLanguage(lang) {
    if (this.currentLanguage.name === lang.name) {
      this.showAnotherLanguages = !this.showAnotherLanguages;
    } else {
      this.currentLanguage = lang;
      this._language.setLanguage(lang);
      this.showAnotherLanguages = !this.showAnotherLanguages;
    }
  }

  ngOnInit() {
    if (window.location.href.includes('/home')) {
      this.showAllLanguages = true;
    }

    const venueId = localStorage.getItem('venueId');
    const HTML = document.getElementById('venue-container-language');
    const venueAttr = document.createAttribute('venueId');
    venueAttr.value = venueId;
    HTML.setAttributeNode(venueAttr);
    this.currentLanguage = this._language.getCurrentLanguage();
  }
}
