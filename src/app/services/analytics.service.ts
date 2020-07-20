import { Injectable } from "@angular/core";
import { NgxAnalytics } from 'ngx-analytics';


@Injectable({
  providedIn: "root"
})
export class AnalyticsService {
  private _firebaseAnalytics = null;
  constructor(
    private ngx_analytics: NgxAnalytics,
  ) {
  }

  event(event) {
    this.ngx_analytics.eventTrack.next(event);
    // @ts-ignore
    window.firebase.analytics().logEvent(event.action, event.properties);
  }
}
  
