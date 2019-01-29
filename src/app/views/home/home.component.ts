import { Component, OnInit, OnChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ApiService } from "./../../services/api.service";
import { MapboxService } from "../../services/mapbox.service";
import { DeviceService } from '../../services/device.service';

@Component({
  templateUrl: "home.component.html",
  styleUrls: ["home.component.scss"]
})

export class HomeComponent implements OnInit {
  venueId: any;
  langId: any;
  startPointImages: Object = {
      '12': 'assets/imgs/start.svg',
      '19': 'assets/imgs/yafe/start-yafe.svg',
      '18': 'assets/imgs/hagalil/start.svg'
  };
  startPointImgByVenueId: string;
  constructor(
    public ds: DeviceService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _mapbox: MapboxService
  ) {}

  startSearch() {
    this._router.navigateByUrl(`/search/${this.venueId}/${this.langId}`);
  }

  ngOnInit() {
    const urlString = window.location.href.includes('direction');
    this._route.params.subscribe(params => {
      this.startPointImgByVenueId = this.startPointImages[params.venueId];
      localStorage.setItem("kioskId", params.kioskId);
      localStorage.setItem("venueId", params.venueId);
      localStorage.setItem("langId", params.langId);
      this.langId = params.langId;
      console.log(this.langId);
      this.venueId = params.venueId;
      const HTML = document.getElementById("venue-container");
      const venueAttr = document.createAttribute("venueId");
      venueAttr.value = params.venueId;
      HTML.setAttributeNode(venueAttr);

    });
    this._mapbox.initMap(this.venueId, null, urlString);
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
