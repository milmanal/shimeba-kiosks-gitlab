import { Component, OnInit, Input } from "@angular/core";
import { Languages } from "./../../_languages";
import { Language } from "../../models";
import { LanguageService } from "./../../services/language.service";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  selector: "app-language-panel",
  templateUrl: "./app-language-panel.component.html",
  styleUrls: ["./app-language-panel.component.scss"]
})
export class AppLanguagePanelComponent implements OnInit {
  currentLanguage: Language;
  languages: Language[] = Languages;
  showAnotherLanguages: Boolean = false;
  showAllLanguages: Boolean = false;

  constructor(private _route: Router, private _language: LanguageService) {
    this._route.events.subscribe(val => {
      if (val instanceof NavigationEnd && val.url.indexOf("home") !== -1) {
        this.showAllLanguages = true;
      } else if (
        val instanceof NavigationEnd &&
        val.url.indexOf("home") === -1
      ) {
        this.showAllLanguages = false;
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
    this.currentLanguage = this._language.getCurrentLanguage();
  }
}
