import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { MapService } from "../../services/map.service";
import { ApiService } from "../../services/api.service";

import { InstructionIcon } from "./../../configs/instruction-icon";
import { Subscription, interval } from "rxjs";
import { LanguageService } from "../../services/language.service";

@Component({
  templateUrl: "direction.component.html",
  styleUrls: ["direction.component.scss"]
})
export class DirectionComponent implements OnInit {
  kioskId: Number;
  poiId: Number;
  kioskData: any;
  poiData: any;
  poiLocation: any;
  instructions: any;
  routeLoaded: Boolean = false;
  languageSubscription: Subscription;
  initLanguage: any;
  intervalSub: Subscription;
  constructor(
    private _language: LanguageService,
    private _mapService: MapService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router
  ) {
    this._route.params.subscribe(params => {
      localStorage.setItem("kioskId", params.kioskId);
      this.kioskId = Number(params.kioskId);
      this.poiId = Number(params.poiId);
    });
  }

  backToMain() {
    localStorage.setItem('needRefresh', 'true');
    this.intervalSub.unsubscribe();
    this._mapService.clearMap();
    const kioskId = localStorage.getItem('kioskId');
    this._router.navigateByUrl(`/home/${kioskId}`)
  }

  getDirectionData() {
    let currentInstr = 0;
    this._api.getDirection(this.kioskData, this.poiData).subscribe(res => {
      this.instructions = res;
      this.routeLoaded = true;
      const curInterval = interval(2000);

      this.intervalSub = curInterval.subscribe(() => {
        this.routing(res, currentInstr);
        currentInstr++;
      });
    });
  }

  routing(instructions, currentInstr) {
    if (currentInstr === 0) {
      document
        .getElementById("start-instr")
        .setAttribute("style", "display: block");
    }
    if (instructions[currentInstr]) {
      const instruction = document.getElementById(
        instructions[currentInstr].instruction.instructions
      );
      this._mapService.addRoute(instructions[currentInstr].points);
      if (instruction) {
        instruction.setAttribute("style", "display: block");
        this._mapService.addInstructionIcon(
          currentInstr + 1,
          [
            Number(instructions[currentInstr].instruction.longitude),
            Number(instructions[currentInstr].instruction.latitude)
          ],
          instructions[currentInstr].instruction.instructionsType
        );
      }
    } else {
      document
        .getElementById("destination-instr")
        .setAttribute("style", "display: block");
      document
        .getElementById("sms-box")
        .setAttribute("style", "display: flex;");
      this._mapService.setDestinationMarker(
        this.poiData.entrances[0].longitude,
        this.poiData.entrances[0].latitude
      );
      this.intervalSub.unsubscribe();
    }
  }

  hasInstructionIcon(instructionType) {
    return InstructionIcon.some(
      instruction => instruction.instructionType === instructionType
    );
  }

  getIconByInstructionType(instructionType) {
    return InstructionIcon.find(
      instruction => instruction.instructionType === instructionType
    ).icon;
  }

  ngOnInit() {
    this.initLanguage = this._language.getCurrentLanguage();
    this.languageSubscription = this._language.observableLanguage.subscribe(
      lang => {
        if(this.initLanguage.name !== lang.name) {
          location.reload();
        }
      }
    );
    this._mapService.initMap();
    this._api
      .getKioskAndPoiData(this.kioskId, this.poiId)
      .subscribe(([kiosk, poi]) => {
        this.kioskData = kiosk;
        this.poiData = poi;
        this.poiLocation = poi.dynamicValues.filter(
          value => value.propertyName === "Location Description"
        );
        this.getDirectionData();
        this._mapService.addMarker(
          this.kioskData.entrances[0].sLongitude,
          this.kioskData.entrances[0].sLatitude,
          "start"
        );
      });
  }
}
