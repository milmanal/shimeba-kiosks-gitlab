import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxAnalytics } from 'ngx-analytics';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error.modal.html',
  styleUrls: ['./error.modal.scss']
})

export class AppErrorModalComponent {
    venueId: any;
    langId: any;

    constructor(
        private ngx_analytics: NgxAnalytics,
        public _router: Router,
        public bsModalRef: BsModalRef
    ) {
        this.venueId = localStorage.getItem('venueId');
        this.langId = localStorage.getItem('langId');
    }

    goToSearchScreen() {
        this.ngx_analytics.eventTrack.next({
            action: 'Click',
            properties: {
                category: 'Back to Search screen',
                label: 'Server Doesn"t respond'
            }
        });
        this.bsModalRef.hide();
        return this._router.navigateByUrl(`/search/${this.venueId}/${this.langId}`);
    }
}
