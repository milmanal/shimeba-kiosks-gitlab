import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MatKeyboardModule } from "@ngx-material-keyboard/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { AppTranslationModule } from "./app-translation.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { LoaderInterceptorService } from './services/loader-intercepter.service';
import { ErrorService } from './services/error.service';
import { ErrorInterceptor } from './services/error-interceptor.service';
import { AppErrorModalComponent } from './components/error-modal/error.modal';
import { AppSuccessModalComponent } from './components/success-modal/success.modal';

import {
  ToastrModule,
} from 'ngx-toastr';
import "hammerjs";


const interceptors = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LoaderInterceptorService,
    multi: true
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
  }
];

const services = [
  ErrorService
];

@NgModule({
  declarations: [AppComponent, AppErrorModalComponent, AppSuccessModalComponent],
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
    MatIconModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-center-center',
      preventDuplicates: true,
    }),
  ],
  providers: [
    interceptors,
    services
  ],
  bootstrap: [AppComponent],
  entryComponents: [AppErrorModalComponent, AppSuccessModalComponent],
  exports: [AppTranslationModule]
})
export class AppModule {}
