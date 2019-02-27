import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { ApiService } from '../../services/api.service';
import { timeout } from 'rxjs/operators';
import { timer } from 'rxjs';

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
        public bsModalService: BsModalService,
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


    animateCloseModal() {
        const time = timer(800);
        document.getElementsByClassName('custom-modal')[0].classList.remove('zoomInUp');
        document.getElementsByClassName('custom-modal')[0].classList.add('zoomOutDown');
        return time.subscribe(_ => this.bsModalRef.hide());
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
        return this._api.sendSms(sendParams) && this.animateCloseModal();
    }
}
