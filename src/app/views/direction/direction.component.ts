import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MapService } from '../../services/map.service';
import { ApiService } from '../../services/api.service';


@Component({
  templateUrl: 'direction.component.html',
  styleUrls: ['direction.component.scss']
})

export class DirectionComponent implements OnInit {
  kioskId: Number;
  poiId: Number;
  kioskData: any;
  poiData: any;
  constructor(
    private _mapService: MapService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router
  ) {
    this._route.params.subscribe(params => {
      localStorage.setItem('kioskId', params.kioskId);
      this.kioskId = Number(params.kioskId);
      this.poiId = Number(params.poiId);
    });
  }

  getDirectionData() {
    this._api.getDirection(this.kioskData, this.poiData).subscribe(res => {
      this._mapService.addRoute(res);
      console.log(res)
    })
  }

  ngOnInit() {
    this._mapService.initMap();
    this._mapService.changeMapLayer('assets/test.png');
    this._api.getKioskAndPoiData(this.kioskId, this.poiId).subscribe(([kiosk, poi]) => {
      this.kioskData = kiosk;
      this.poiData = poi;
      this.getDirectionData();
      this._mapService.addMarker(this.kioskData.entrances[0].sLongitude, this.kioskData.entrances[0].sLatitude, 'start');
    })
  }
}
