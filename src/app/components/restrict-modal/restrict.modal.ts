import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxAnalytics } from 'ngx-analytics';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-restrict-modal',
  templateUrl: './restrict.modal.html',
  styleUrls: ['./restrict.modal.scss']
})

export class AppRestrictModalComponent implements OnInit {

  responseMessage: String;

  venueId: any;
  langId: any;
  kioskId: any;
  error12: any;


  constructor(
    private ngx_analytics: NgxAnalytics,
    public _router: Router,
    public _route: ActivatedRoute,
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
  ) {
    this.venueId = localStorage.getItem('venueId');
    this.kioskId = localStorage.getItem('kioskId');
    this.langId = localStorage.getItem('langId');
  }

  goToSearchScreen() {
    this.bsModalRef.hide();
    return this._router.navigateByUrl(`/search/${this.venueId}/${this.kioskId}/${this.langId}`);
  }

  ngOnInit(): void {
    this.responseMessage = this.bsModalService.config.initialState['message'];
  }
}
