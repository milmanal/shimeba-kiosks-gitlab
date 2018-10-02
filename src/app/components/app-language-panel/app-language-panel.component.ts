import { Component, OnInit } from '@angular/core';
import { Languages } from './../../_languages';
import { Language } from '../../models';
import { LanguageService } from './../../services/language.service';

@Component({
  selector: 'app-language-panel',
  templateUrl: './app-language-panel.component.html',
  styleUrls: ['./app-language-panel.component.scss']
})
export class AppLanguagePanelComponent implements OnInit {
  currentLanguage: Language;
  languages: Language[] = Languages;
  showAnotherLanguages: Boolean = false;

  constructor(private _language: LanguageService) {
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
    this.currentLanguage = this._language.getCurrentLanguage();
  }
}
