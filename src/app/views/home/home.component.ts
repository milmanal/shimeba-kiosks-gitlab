import { Component, OnInit } from '@angular/core';
import { MapService } from './../../services/map.service';

declare const keyman: any;

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})

export class HomeComponent implements OnInit {
  mapImgUrl: String = 'https://i.imgur.com/xYT9Hpn.jpg';
  minX: Number = 34.788334707804594;
  minY: Number = 32.07787512303872;
  maxX: Number = 34.79172649237924;
  maxY: Number = 32.08222892783535;

  constructor(private _mapService: MapService) {
  }
  ngOnInit() {
    this._mapService.initMap(this.mapImgUrl, this.minX, this.minY, this.maxX, this.maxY);
    this._mapService.addMarker(34.7898267288336, 32.0804542067765);
  }
}
