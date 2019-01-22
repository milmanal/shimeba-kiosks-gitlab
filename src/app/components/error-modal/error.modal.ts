import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error.modal.html',
  styleUrls: ['./error.modal.scss']
})

export class AppErrorModalComponent {
    venueId: any;

    constructor(
        public _router: Router,
        public bsModalRef: BsModalRef) {
        this.venueId = localStorage.getItem('venueId');
    }

    goToSearchScreen() {
        this.bsModalRef.hide();
        return this._router.navigateByUrl(`/search/${this.venueId}`);
    }
}
