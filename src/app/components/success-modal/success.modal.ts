import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxAnalytics } from 'ngx-analytics';

import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success.modal.html',
  styleUrls: ['./success.modal.scss']
})

export class AppSuccessModalComponent {

    constructor(
      private ngx_analytics: NgxAnalytics,
      public bsModalRef: BsModalRef,
      private _analyticsService: AnalyticsService,
    ) {
      this._analyticsService.event({
        action: 'SMS success message',
      });
    }

    // closeModal() {
    //     return this.bsModalRef.hide();
    // }
}
