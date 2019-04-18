import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxAnalytics } from 'ngx-analytics';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success.modal.html',
  styleUrls: ['./success.modal.scss']
})

export class AppSuccessModalComponent {

    constructor(
      private ngx_analytics: NgxAnalytics,
      public bsModalRef: BsModalRef
    ) {
      this.ngx_analytics.eventTrack.next({
        action: 'SMS was sent',
      });
    }

    // closeModal() {
    //     return this.bsModalRef.hide();
    // }
}
