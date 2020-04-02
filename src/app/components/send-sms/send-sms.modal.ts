import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiService } from '../../services/api.service';
import { Subject, timer } from 'rxjs';
import { NgxAnalytics } from 'ngx-analytics';

@Component({
  selector: 'app-send-sms-modal',
  templateUrl: './send-sms.modal.html',
  styleUrls: ['./send-sms.modal.scss']
})

export class AppSendSmsModalComponent {
    venueId: any;
    langId: any;
    phoneNumber: String = '';
    validationMessage: Boolean = false;
    dynamicCloseModalIcon: String;
    onClose: Subject<boolean> = new Subject();

    constructor(
        private ngx_analytics: NgxAnalytics,
        public _router: Router,
        public bsModalRef: BsModalRef,
        public bsModalService: BsModalService,
        private _api: ApiService
    ) {
        this.venueId = localStorage.getItem('venueId');
        this.langId = localStorage.getItem('langId');
        this.dynamicCloseModalIcon = `assets/imgs/close/${this.venueId}.svg`;
    }

    enterNumber(number) {
        if (number === 'del') {
            this.phoneNumber = this.phoneNumber.slice(0, -1);
        } else {
            this.phoneNumber += number;
        }
    }

    animateCloseModal() {
        const time = timer(800);
        document.getElementsByClassName('custom-modal')[0].classList.remove('zoomInUp');
        document.getElementsByClassName('custom-modal')[0].classList.add('zoomOutDown');
        this.onClose.next(false);
        return time.subscribe(_ => this.bsModalRef.hide());
    }

    sendSms() {
        this.ngx_analytics.eventTrack.next({
            action: 'Click',
            properties: {
                category: 'Send SMS Button',
            }
        });
        const sendParams = {
          text: window.location.href,
          recipientNumber: this.phoneNumber,
          senderName: 'Ichilov Hospital',
        };
        if (!sendParams.recipientNumber) {
          this.validationMessage = true;
          return this.validationMessage;
        }
        this.validationMessage = false;
        return this._api.sendSms(sendParams) && this.animateCloseModal();
    }
}
