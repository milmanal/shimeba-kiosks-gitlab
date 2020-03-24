import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxAnalytics } from 'ngx-analytics';

@Component({
  selector: 'app-restrict-modal',
  templateUrl: './restrict.modal.html',
  styleUrls: ['./restrict.modal.scss']
})

export class AppRestrictModalComponent {

    constructor(
      private ngx_analytics: NgxAnalytics,
      public bsModalRef: BsModalRef
    ) {
      this.ngx_analytics.eventTrack.next({
        action: 'Restrict Modal',
      });
    }
}
