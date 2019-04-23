import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { NgxAnalyticsGoogleAnalytics } from 'ngx-analytics/ga';

NgxAnalyticsGoogleAnalytics.prototype.createGaSession({
  domain: 'auto',
  trackingId: 'UA-50810203-9'
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

