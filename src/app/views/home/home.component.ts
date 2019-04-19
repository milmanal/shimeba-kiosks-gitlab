import { Component, OnInit, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from './../../services/api.service';
import { MapboxService } from '../../services/mapbox.service';
import { DeviceService } from '../../services/device.service';
import { NgxAnalytics } from 'ngx-analytics';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})

export class HomeComponent implements OnInit {
  venueId: any;
  langId: any;
  startPointImages: Object = {
      '12': 'assets/imgs/start.svg',
      '18': 'assets/imgs/yafe/start-yafe.svg',
      '19': 'assets/imgs/hagalil/start.svg'
  };
  startPointImgByVenueId: string;
  constructor(
    private ngx_analytics: NgxAnalytics,
    public ds: DeviceService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _mapbox: MapboxService
  ) {}

  startSearch() {
    this._mapbox.clearMap();
    this._router.navigateByUrl(`/search/${this.venueId}/${this.langId}`);
  }

  ngOnInit() {
    this.ngx_analytics.eventTrack.next({
      action: 'URL',
      properties: {
        category: 'URL of Current Page',
        label: window.location.pathname,
      },
    });
    const urlString = window.location.href.includes('direction');
    this._route.params.subscribe(params => {
      this.startPointImgByVenueId = this.startPointImages[params.venueId];
      localStorage.setItem('kioskId', params.kioskId);
      localStorage.setItem('venueId', params.venueId);
      localStorage.setItem('langId', params.langId);
      this.langId = params.langId;
      this.venueId = params.venueId;
      const HTML = document.getElementById('venue-container');
      const venueAttr = document.createAttribute('venueId');
      venueAttr.value = params.venueId;
      HTML.setAttributeNode(venueAttr);

    });
    this._mapbox.initMap(this.venueId, null, urlString);
    this._api.getKioskData().subscribe(res => {
      localStorage.setItem('kioskData', JSON.stringify(res.entrances[0]));
      this._mapbox.addMarker(
        'start-point',
        res.entrances[0].longitude,
        res.entrances[0].latitude
      );

      this._route.params.subscribe(params => {
        let offsetOptons = [0, 0];
        switch (params.langId) {
          case 'es': {
            offsetOptons = [-67, -85];
            break;
          }
          case 'pt': {
            offsetOptons = [-110, -85];
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
            offsetOptons = [-60, -85];
            break;
          }
          case 'he': {
            offsetOptons = [-40, -85];
            break;
          }
          case 'en': {
            offsetOptons = [-95, -85];
            break;
          }
        }

        this._mapbox.addKioskMarker(
          res.entrances[0].longitude,
          res.entrances[0].latitude,
          offsetOptons
        );
      });
    });
  }
}
