import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import * as moment from "moment";
import { Languages } from "./../_languages";
import { Language } from "../models";

@Injectable()
export class LanguageService {
  languages: Language[] = Languages;
  currentLanguage: Language;
  observableLanguage;

  constructor(private translate: TranslateService) {
    const { currentLang } = this.translate;
    this.currentLanguage = this.languages.find(
      lang => {
        console.log(lang);
        return currentLang === lang.name;
      }
    );
    this.observableLanguage = new BehaviorSubject<Language>(
      this.currentLanguage
    );
  }

  setLanguage(lang: Language) {
    this.translate.use(lang.name);
    moment.locale(lang.name);
    const HTML = document.getElementsByTagName("html")[0];

    const dirAttr = document.createAttribute("dir");
    dirAttr.value = lang.direction;

    const languageAttr = document.createAttribute("lang");
    languageAttr.value = lang.name;

    HTML.setAttributeNode(dirAttr);
    HTML.setAttributeNode(languageAttr);
    this.currentLanguage = lang;
    this.observableLanguage.next(lang);
    localStorage.setItem("currentLanguage", lang.name);
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getCurrentDirection() {
    return this.currentLanguage.direction;
  }
}
