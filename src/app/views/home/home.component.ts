import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MapService } from './../../services/map.service';
import { ApiService } from './../../services/api.service';

declare const keyman: any;

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})

export class HomeComponent implements OnInit {
  constructor(
    private _mapService: MapService,
    private _route: ActivatedRoute,
    private _api: ApiService
  ) {
    this._route.params.subscribe(params => {
      localStorage.setItem('kioskId', params.kioskId);
    });
  }
  ngOnInit() {
    this._mapService.initMap();
    this._api.getKioskData().subscribe(res => {
      this._mapService.addMarker(res.entrances[0].longitude, res.entrances[0].latitude);
    });
  }
}
