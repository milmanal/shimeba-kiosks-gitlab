import {
  Component,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  AfterViewInit
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "../../../services/api.service";
import { DeviceService } from "../../../services/device.service";

import { InstructionIcon } from "../../../configs/instruction-icon";
import { Subscription, interval } from "rxjs";
import { LanguageService } from "../../../services/language.service";
import { MapboxService } from "../../../services/mapbox.service";

import { BsModalRef } from "ngx-bootstrap/modal/bs-modal-ref.service";

@Component({
  selector: "direction-mobile",
  templateUrl: "mobile.component.html",
  styleUrls: ["mobile.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class MobileComponent implements OnInit, AfterViewInit {
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
  modalRef: BsModalRef;
  phoneNumber: String = "";
  instructionListOpen: Boolean = true;
  allPath = [];
  venueId: any;
  selectedInstructionIndex: any;
  constructor(
    private _language: LanguageService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _mapbox: MapboxService,
    public ds: DeviceService
  ) {
    this._route.params.subscribe(params => {
      localStorage.setItem("kioskId", params.kioskId);
      localStorage.setItem("venueId", params.venueId);
      this.venueId = params.venueId;
      this.kioskId = Number(params.kioskId);
      this.poiId = Number(params.poiId);
    });
  }

  showHideInstructionList() {
    if (this.instructionListOpen) {
      this.instructionListOpen = !this.instructionListOpen;
      this.selectedInstructionIndex = 0;
      this._mapbox.goToInstruction(
        this.instructions[this.selectedInstructionIndex].instruction
      );
    } else {
      this.instructionListOpen = !this.instructionListOpen;
      this._mapbox.zoomToLinePoligon(this.allPath, [0, 200]);
    }
  }

  selectInstruction(instr, i) {
    this.instructionListOpen = false;
    this.selectedInstructionIndex = i;
    this._mapbox.goToInstruction(instr);
  }

  nextInstruction() {
    this.selectedInstructionIndex++;
    this._mapbox.goToInstruction(
      this.instructions[this.selectedInstructionIndex].instruction
    );
  }

  prevInstruction() {
    this.selectedInstructionIndex--;
    this._mapbox.goToInstruction(
      this.instructions[this.selectedInstructionIndex].instruction
    );
  }

  getDirectionData() {
    let currentInstr = 0;
    this._api
      .getDirection(this.kioskData, this.poiData, this.venueId)
      .subscribe(res => {
        this.instructions = res;
        this.routeLoaded = true;
        const curInterval = interval(2000);
        res.map(step => {
          step.points.map(poi => this.allPath.push(poi));
        });
        this._mapbox.zoomToLinePoligon(this.allPath, [0, 200]);
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
      this._mapbox.addRouteLine(instructions[currentInstr].points);
      if (instruction) {
        instruction.setAttribute("style", "display: block");
        this._mapbox.addInstructionIcon(
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
      this._mapbox.setDestinationMarker(
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
    this._route.params.subscribe(params => {
      const HTML = document.getElementById("venue-container");
      const venueAttr = document.createAttribute("venueId");
      venueAttr.value = params.venueId;
      HTML.setAttributeNode(venueAttr);
    });
    this.initLanguage = this._language.getCurrentLanguage();
    this.languageSubscription = this._language.observableLanguage.subscribe(
      lang => {
        if (this.initLanguage.name !== lang.name) {
          location.reload();
        }
      }
    );
  }

  ngAfterViewInit() {
    this._mapbox.initMap(this.venueId, true);
    this._api
      .getKioskAndPoiData(this.kioskId, this.poiId)
      .subscribe(([kiosk, poi]) => {
        this.kioskData = kiosk;
        this.poiData = poi;
        this.poiLocation = poi.dynamicValues.filter(
          value => value.propertyName === "Location Description"
        );
        this._mapbox.addMarker(
          "start-point",
          this.kioskData.entrances[0].sLongitude,
          this.kioskData.entrances[0].sLatitude
        );
        this.getDirectionData();
      });
  }
}
