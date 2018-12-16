import { Component, OnInit, OnChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ApiService } from "./../../services/api.service";
import { MapboxService } from "../../services/mapbox.service";

@Component({
  templateUrl: "home.component.html",
  styleUrls: ["home.component.scss"]
})
export class HomeComponent implements OnInit {
  venueId: any;
  startPointImages: Object = {
      '12': 'assets/imgs/start.svg',
      '13': 'assets/imgs/yafe/start-yafe.svg'
  };
  startPointImgByVenueId: string;
  constructor(
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _mapbox: MapboxService
  ) {}

  startSearch() {
    this._router.navigateByUrl("/search");
  }

  ngOnInit() {
    this._route.params.subscribe(params => {
      this.startPointImgByVenueId = this.startPointImages[params.venueId];
      console.log(params.venueId);
      localStorage.setItem("kioskId", params.kioskId);
      localStorage.setItem("venueId", params.venueId);
      this.venueId = params.venueId;
      const HTML = document.getElementById("venue-container");
      const venueAttr = document.createAttribute("venueId");
      venueAttr.value = params.venueId;
      HTML.setAttributeNode(venueAttr);
    });
    this._mapbox.initMap(this.venueId);
    this._api.getKioskData().subscribe(res => {
      localStorage.setItem('kioskData', JSON.stringify(res.entrances[0]));
      this._mapbox.addMarker(
        "start-point",
        res.entrances[0].longitude,
        res.entrances[0].latitude
      );
      this._mapbox.addKioskMarker(
        res.entrances[0].longitude,
        res.entrances[0].latitude
      );
    });
  }
}
