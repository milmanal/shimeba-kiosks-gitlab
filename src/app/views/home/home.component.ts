import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from './../../services/api.service';
import { MapboxService } from '../../services/mapbox.service';
import { DeviceService } from '../../services/device.service';
import { AnalyticsService } from '../../services/analytics.service';
import { NgxAnalytics } from 'ngx-analytics';
import { Subscription, timer } from 'rxjs';
import { Config } from '../../configs/config';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})

export class HomeComponent implements OnInit {
  venueId: any;
  langId: any;
  kioskId: any;
  // countClick = 0;
  phoneNumberBadge: Boolean;
  badgeImg = 'assets/imgs/poria/phone-badge.svg';
  kioskDataSubsciption: Subscription;
  startPointImages: Object = {
      '12': 'assets/imgs/start.svg',
      '18': 'assets/imgs/yafe/start-yafe.svg',
      '19': 'assets/imgs/hagalil/start.svg',
      '20': 'assets/imgs/ziv/start-ziv.svg',
      '24': 'assets/imgs/poria/start-poria.svg',
      '25': 'assets/imgs/barzilay/start.svg',
      '27': 'assets/imgs/bneizion/start.svg',
  };
  startPointImgByVenueId: string;
  constructor(
    private ngx_analytics: NgxAnalytics,
    public ds: DeviceService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _mapbox: MapboxService,
    private _analyticsService: AnalyticsService,
  ) {
  }

  startSearch() {
    this._mapbox.clearMap();
    // this.countClick = this.countClick + 1;
    // console.log(this.countClick);
    this._analyticsService.event({
      action: 'Home page click action',
      properties: {
        category: 'Begin from home page',
        label: `Kiosk id: ${this.kioskId}, Venue id: ${this.venueId}`,
      },
    });
    this._router.navigateByUrl(`/search/${this.venueId}/${this.kioskId}/${this.langId}`);
  }

  displayTheMarker(res, offsetOptons) {
    return this._mapbox.addKioskMarker(
      res.entrances[0].longitude,
      res.entrances[0].latitude,
      offsetOptons
    );
  }

  ngOnInit() {
    const pointAppearing = timer(300);
    this._analyticsService.event({
      action: 'URL',
      properties: {
        category: 'URL of Current Page',
        label: window.location.pathname,
      },
    });

    this._route.params.subscribe(params => {
      this.startPointImgByVenueId = this.startPointImages[params.venueId];
      localStorage.setItem('kioskId', params.kioskId);
      localStorage.setItem('venueId', params.venueId);
      localStorage.setItem('langId', params.langId);
      this.langId = params.langId;
      this.venueId = params.venueId;
      this.kioskId = params.kioskId;
      const HTML = document.getElementById('venue-container');
      const venueAttr = document.createAttribute('venueId');
      venueAttr.value = params.venueId;
      HTML.setAttributeNode(venueAttr);
      this.phoneNumberBadge = Config[this.venueId].homePagePhoneBadge;
    });

    if ( this.phoneNumberBadge && typeof Config[this.venueId].homePageBadgeImg !== 'undefined') {
      this.badgeImg = Config[this.venueId].homePageBadgeImg;
    }
    const urlString = window.location.href.includes('direction');
    this._mapbox.initMap(this.venueId, null, urlString);
    this._api.getKioskData().subscribe(res => {
      localStorage.setItem('kioskData', JSON.stringify(res.entrances[0]));
      let offsetOptons = [0, 0];
      this._route.params.subscribe(params => {

        switch (params.langId) {
          case 'es': {
            offsetOptons = [-67, -85];
            break;
          }
          case 'pt': {
            offsetOptons = [-88, -85];
            break;
          }
          case 'fr': {
            offsetOptons = [-42, -85];
            break;
          }
          case 'am': {
            offsetOptons = [-36, -85];
            break;
          }
          case 'ar': {
            offsetOptons = [-30, -85];
            break;
          }
          case 'ru': {
            offsetOptons = [-40, -80];
            break;
          }
          case 'he': {
            offsetOptons = [-40, -85];
            break;
          }
          case 'en': {
            offsetOptons = [-90, -85];
            break;
          }
        }
        this.displayTheMarker(res, offsetOptons);
      });
      pointAppearing.subscribe(val => {
        this._mapbox.addMarker(
          'start-point',
          res.entrances[0].longitude,
          res.entrances[0].latitude
        );
      });
    });
  }
}
