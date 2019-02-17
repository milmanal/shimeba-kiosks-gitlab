import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from '../../services/api.service';

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

    constructor(
        public _router: Router,
        public bsModalRef: BsModalRef,
        private _api: ApiService
    ) {
        this.venueId = localStorage.getItem('venueId');
        this.langId = localStorage.getItem('langId');
    }

    enterNumber(number) {
        if (number === 'del') {
            this.phoneNumber = this.phoneNumber.slice(0, -1);
        } else {
            this.phoneNumber += number;
        }
    }

    sendSms() {
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
        // this.phoneNumber = '';
        return this._api.sendSms(sendParams) && this.bsModalRef.hide();
    }
}
