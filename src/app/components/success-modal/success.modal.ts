import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success.modal.html',
  styleUrls: ['./success.modal.scss']
})

export class AppSuccessModalComponent {

    constructor(public bsModalRef: BsModalRef) {}

    // closeModal() {
    //     return this.bsModalRef.hide();
    // }
}
