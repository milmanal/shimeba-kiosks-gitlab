import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserActionService {

  venueId: any;
  kioskId: any;
  langId: any;

  constructor(
    private _router: Router
  ) {
    this.venueId = localStorage.getItem('venueId');
    this.kioskId = localStorage.getItem('kioskId');
    this.langId = localStorage.getItem('langId');
  }

  _userActionOccured: Subject<void> = new Subject();
  get userActionOccured(): Observable<void> { return this._userActionOccured.asObservable(); }

  notifyUserAction() {
    this._userActionOccured.next();
  }

  goToMainScreen() {
    console.log('main screen');
    this._router.navigateByUrl(`/home/${this.venueId}/${this.kioskId}/${this.langId}`);
  }
}
