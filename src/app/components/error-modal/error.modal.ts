import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxAnalytics } from 'ngx-analytics';
import { TranslateStore } from '@ngx-translate/core';

import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error.modal.html',
  styleUrls: ['./error.modal.scss']
})

export class AppErrorModalComponent {
    venueId: any;
    langId: any;
    kioskId: any;
    error12: any;


    constructor(
        private ngx_analytics: NgxAnalytics,
        public _router: Router,
        public _route: ActivatedRoute,
        public bsModalRef: BsModalRef,
        private _translation: TranslateStore,
        private _analyticsService: AnalyticsService,
    ) {
        this.venueId = localStorage.getItem('venueId');
        this.kioskId = localStorage.getItem('kioskId');
        this.langId = localStorage.getItem('langId');

        this._route.params.subscribe(() => {
            this.error12 = `server_call_fails_12`;
        });
        const { id } = JSON.parse(localStorage.getItem('poiValues'));

        this._analyticsService.event({
            action: 'Error Modal Appear',
            properties: {
                category: 'Error thrown',
                label: `Error occurs when you go to poi ID: ${id}`
            }
        });
    }

    goToSearchScreen() {
        this._analyticsService.event({
            action: 'Click on Error Modal',
            properties: {
                category: 'Back to Search screen',
                label: 'Server Doesn"t respond'
            }
        });
        this.bsModalRef.hide();
        return this._router.navigateByUrl(`/search/${this.venueId}/${this.kioskId}/${this.langId}`);
    }
}
