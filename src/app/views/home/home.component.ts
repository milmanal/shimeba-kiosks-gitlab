import { Component, OnInit, OnChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { MapService } from "./../../services/map.service";
import { ApiService } from "./../../services/api.service";
import { MapboxService } from "../../services/mapbox.service";

declare const keyman: any;

@Component({
  templateUrl: "home.component.html",
  styleUrls: ["home.component.scss"]
})
export class HomeComponent implements OnInit {
  constructor(
    private _mapService: MapService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _mapbox: MapboxService
  ) {
    this._route.params.subscribe(params => {
      localStorage.setItem("kioskId", params.kioskId);
    });
  }

  startSearch() {
    this._router.navigateByUrl("/search");
  }

  ngOnInit() {
    this._mapbox.initMap();
    this._api.getKioskData().subscribe(res => {
      this._mapbox.addStartMarker('assets/imgs/start.svg', res.entrances[0].longitude, res.entrances[0].latitude);
    });
    // this._mapService.initMap();
    // this._api.getKioskData().subscribe(res => {
    //   this._mapService.addMarker(
    //     res.entrances[0].longitude,
    //     res.entrances[0].latitude,
    //     "start"
    //   );
    // });
  }
}
