import { Injectable } from "@angular/core";
import { NgxAnalytics } from 'ngx-analytics';
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

import analyticsConfig from '../configs/analytics';

@Injectable({
  providedIn: "root"
})
export class AnalyticsService {
  private _appInsights = null;
  constructor(
    private ngx_analytics: NgxAnalytics,
  ) {

    this._appInsights = new ApplicationInsights({ config: analyticsConfig.appInsights });
    this._appInsights.loadAppInsights();
    this._appInsights.trackPageView();
    console.log('initAnalytics')
  }

  event(event) {
    console.log('event', event);
    this.ngx_analytics.eventTrack.next(event);
    this._appInsights.trackEvent({ name: event.action}, event.properties);
  }
}
  
