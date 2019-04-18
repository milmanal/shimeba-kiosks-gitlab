import { Component, OnInit } from '@angular/core';
import { Languages } from './../../_languages';
import { Language } from '../../models';
import { LanguageService } from './../../services/language.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DeviceService } from './../../services/device.service';
import { from } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NgxAnalyticsGoogleAnalytics } from 'ngx-analytics/ga';
import { NgxAnalytics } from 'ngx-analytics';

@Component({
  selector: 'app-language-panel',
  templateUrl: './app-language-panel.component.html',
  styleUrls: ['./app-language-panel.component.scss']
})
export class AppLanguagePanelComponent implements OnInit {
  currentLanguage: Language;
  languages: Language[] = Languages;
  showAnotherLanguages: Boolean = true;
  showAllLanguages: Boolean = false;
  languagePanelOnTheBottom: Boolean = true;
  isRoutePage: Boolean = false;
  venueId: any;

  constructor(
    private ngx_analytics: NgxAnalytics,
    private _route: ActivatedRoute,
    private _router: Router,
    private _language: LanguageService,
    public ds: DeviceService
  ) {  }

  selectLanguage(lang) {
    const replaceable = `/${this.currentLanguage.name}`;
    const url = this._router.url;
    const urlWithChangedLangId = url.replace(replaceable, `/${lang.name}`);
    this.showAnotherLanguages = !this.showAnotherLanguages;
    if (this.currentLanguage.name !== lang.name) {
      this.currentLanguage = lang;
      this._language.setLanguage(lang);
      this._router.navigateByUrl(urlWithChangedLangId);
    }

    this.ngx_analytics.eventTrack.next({
      action: 'Click',
      properties: {
        category: 'Switched Language',
        label: this.currentLanguage.name,
      },
    });
  }

  ngOnInit() {
    const venueId = localStorage.getItem('venueId');
    const HTML = document.getElementById('venue-container-language');
    const venueAttr = document.createAttribute('venueId');
    if (window.location.href.includes('/home')) {
      this.languagePanelOnTheBottom = false;
    } else {
      this.showAnotherLanguages = false;
    }

    venueAttr.value = venueId;
    HTML.setAttributeNode(venueAttr);

    this._route.params.subscribe(params => {
      const sourceLangArray = from(this.languages);
      const langs = sourceLangArray.pipe(filter(lang => lang.name === params.langId));
      langs.subscribe(val => {
        this.currentLanguage = val;
        this._language.setLanguage(val);
      });
    });
  }
}
