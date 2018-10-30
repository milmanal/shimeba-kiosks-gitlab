import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from "@ngx-translate/core";
import { NgModule } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LanguageService } from "./services/language.service";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, `/assets/translations/`, ".json");
}

export class ShimebaMissingTranslationHandler
  implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    return params.key;
  }
}

const translationOptions = {
  loader: {
    provide: TranslateLoader,
    useFactory: createTranslateLoader,
    deps: [HttpClient]
  },
  missingTranslationHandler: {
    provide: MissingTranslationHandler,
    useClass: ShimebaMissingTranslationHandler
  },
  useDefaultLang: true
};

@NgModule({
  imports: [TranslateModule.forRoot(translationOptions)],
  exports: [TranslateModule],
  providers: [TranslateService, LanguageService]
})
export class AppTranslationModule {
  private getDefaultLanguage() {
    let defaultLanguageString: string = localStorage.getItem("currentLanguage");

    if (!defaultLanguageString && navigator) {
      defaultLanguageString = "he";
    }

    return this.languageService.languages.find(
      lang => lang.name === defaultLanguageString
    );
  }

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    translate.setDefaultLang("en");

    const currentLanguage = this.getDefaultLanguage();

    if (currentLanguage) {
      languageService.setLanguage(currentLanguage);
    }
  }
}
