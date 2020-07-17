import { Injectable } from "@angular/core";
import { NgxAnalytics } from 'ngx-analytics';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: "root"
})
export class AnalyticsService {
  private _firebaseAnalytics = null;
  constructor(
    private ngx_analytics: NgxAnalytics,
  ) {
    // firebase.initializeApp(analyticsConfig.firebase);
    // this._firebaseAnalytics = ;
  }

  event(event) {
    this.ngx_analytics.eventTrack.next(event);
    window.firebase.analytics().logEvent(event.action, event.properties);
  }
}
  
