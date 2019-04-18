import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NgxAnalytics } from 'ngx-analytics';

@Injectable({
  providedIn: 'root'
})
export class UserActionService {

  venueId = localStorage.getItem('venueId');
  kioskId = localStorage.getItem('kioskId');
  _userActionOccured: Subject<void> = new Subject();

  constructor(
    private ngx_analytics: NgxAnalytics,
    private _router: Router,
  ) {}

  get userActionOccured(): Observable<void> { return this._userActionOccured.asObservable(); }

  notifyUserAction() {
    this._userActionOccured.next();
  }

  goToMainScreen() {
    this.ngx_analytics.eventTrack.next({
      action: 'User Inactivity',
      properties: {
        category: 'Back to the main screen',
      },
    });
    this._router.navigateByUrl(`/home/${this.venueId}/${this.kioskId}/he`);
  }
}
