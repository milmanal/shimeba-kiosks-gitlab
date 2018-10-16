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
  poiLocation: any;
  instructions: any;
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
    let currentInstr = 0;
    this._api.getDirection(this.kioskData, this.poiData).subscribe(res => {
      console.log(res)
      this.instructions = res;
      const interval = setInterval(()=> {
        if(currentInstr === 0) {
          document.getElementById('start-instr').setAttribute('style', 'display: block');
        }
        if(res[currentInstr]) {
          const instruction = document.getElementById(res[currentInstr].instruction.instructions);
          this._mapService.addRoute(res[currentInstr].points);
          if(instruction) {
            instruction.setAttribute('style', 'display: block');
            this._mapService.addInstructionNumber(currentInstr+1, [Number(res[currentInstr].instruction.longitude), Number(res[currentInstr].instruction.latitude)]);
          }
        } else {
          document.getElementById('destination-instr').setAttribute('style', 'display: block');
          document.getElementById('sms-box').setAttribute('style', 'visibility: visible');
          this._mapService.setDestinationMarker(this.poiData.entrances[0].longitude, this.poiData.entrances[0].latitude);
          clearInterval(interval);
        }
        currentInstr++;
      }, 2000)
    })
  }

  ngOnInit() {
    this._mapService.initMap();
    this._api.getKioskAndPoiData(this.kioskId, this.poiId).subscribe(([kiosk, poi]) => {
      this.kioskData = kiosk;
      this.poiData = poi;
      this.poiLocation = poi.dynamicValues.filter((value) => value.propertyName === 'Location Description');
      this.getDirectionData();
      this._mapService.addMarker(this.kioskData.entrances[0].sLongitude, this.kioskData.entrances[0].sLatitude, 'start');
    })
  }
}
