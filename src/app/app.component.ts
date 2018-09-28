import { Component, OnInit } from '@angular/core';
import { MapService } from './services/map.service';

declare const keyman: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // route: any = [
  //   [34.789826728833600, 32.080454206776500],
  //   [34.789826728833600, 32.080454206776500],
  //   [34.789796596480110, 32.080455572997340],
  //   [34.789695590830860, 32.080460152660110],
  //   [34.789693005730335, 32.080460269870270],
  //   [34.789635729875116, 32.080462866795250],
  //   [34.789551123737176, 32.080466702893090],
  //   [34.789495501586010, 32.080469224837880],
  //   [34.789463932498710, 32.080470656200940],
  //   [34.789458123495870, 32.080556956990840],
  //   [34.789452550118310, 32.080639757163810],
  //   [34.789447825923080, 32.080678323873620],
  //   [34.789481051266190, 32.080677778239030]
  // ];
  // mapImgUrl: String = 'https://i.imgur.com/xYT9Hpn.jpg';
  // mapImgUrlTest: String = 'https://i.imgur.com/L5geGZc.jpg';
  // minX: Number = 34.788334707804594;
  // minY: Number = 32.07787512303872;
  // maxX: Number = 34.79172649237924;
  // maxY: Number = 32.08222892783535;

  // constructor(private _mapService: MapService) {
  // }
  ngOnInit() {
    // keyman.init({attachType: 'auto'});
    // keyman.addKeyboards('@am');
    // this._mapService.initMap(this.mapImgUrl, this.minX, this.minY, this.maxX, this.maxY);
    // this._mapService.addMarker(34.7898267288336, 32.0804542067765);
    // this._mapService.addMarker(34.78948105126619, 32.08067777823903);
    // this._mapService.addRoute(this.route);
    // this._mapService.changeMapLayer(this.mapImgUrlTest);
  }
}
