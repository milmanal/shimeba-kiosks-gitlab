import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success.modal.html',
  styleUrls: ['./success.modal.scss']
})

export class AppSuccessModalComponent {
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
