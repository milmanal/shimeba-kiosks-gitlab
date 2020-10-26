import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxAnalytics } from 'ngx-analytics';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-loader-modal',
  templateUrl: './loader.modal.html',
  styleUrls: ['./loader.modal.scss']
})

export class AppLoaderModalComponent implements OnInit {

  constructor(
    private ngx_analytics: NgxAnalytics,
    public _router: Router,
    public _route: ActivatedRoute,
    public bsModalRef: BsModalRef,
    public bsModalService: BsModalService,
  ) {}

  ngOnInit(): void {
  }
}
