import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatKeyboardModule } from '@ngx-material-keyboard/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AppLanguagePanelComponent } from './components';
import { AppTranslationModule } from './app-translation.module';
import { ModalModule } from 'ngx-bootstrap/modal';

import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent,
    AppLanguagePanelComponent
  ],
  imports: [
    ModalModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    AppTranslationModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatKeyboardModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    AppTranslationModule
  ]
})
export class AppModule { }
