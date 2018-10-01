import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AppLanguagePanelComponent } from './components';
import { AppTranslationModule } from './app-translation.module';
@NgModule({
  declarations: [
    AppComponent,
    AppLanguagePanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppTranslationModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    AppTranslationModule
  ]
})
export class AppModule { }
