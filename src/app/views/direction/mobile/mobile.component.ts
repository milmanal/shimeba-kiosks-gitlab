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
import { NgxAnalytics } from "ngx-analytics";

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
  currentInstr: any;
  routeLoaded: Boolean = false;
  languageSubscription: Subscription;
  initLanguage: any;
  routeSubscribtion: Subscription;
  modalRef: BsModalRef;
  phoneNumber: String = "";
  instructionListOpen: Boolean = true;
  allPath = [];
  venueId: any;
  selectedInstructionIndex: any;

  imgByVenueId = {
    '12': [
      'assets/imgs/start.svg',
      'assets/imgs/point.svg',
      'assets/imgs/route-dest.svg',
      'assets/imgs/destination-panel.svg',
      'assets/imgs/back-arrow.png',
      'assets/imgs/yafe/bullet.svg'
    ],

    '18': [
      'assets/imgs/yafe/start-yafe.svg',
      'assets/imgs/yafe/route-disk.svg',
      'assets/imgs/yafe/destination-reached.svg',
      'assets/imgs/yafe/destination-panel.png',
      'assets/imgs/yafe/back-arrow.svg',
      'assets/imgs/yafe/bullet.svg'
    ],

    '19': [
      'assets/imgs/hagalil/route-disk.svg',
      'assets/imgs/hagalil/route-disk.svg',
      'assets/imgs/hagalil/destination.svg',
      'assets/imgs/hagalil/destination.svg',
      'assets/imgs/yafe/back-arrow.svg',
      'assets/imgs/yafe/bullet.svg'
    ]
  };

  applyImgsByVenueId: any;
  constructor(
    private ngx_analytics: NgxAnalytics,
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
      this._mapbox.zoomToLinePoligon(this.allPath, [0, 150], 18, {
        top: 60,
        left: 60,
        right: 60,
        bottom: 60
      });
    }
    this.ngx_analytics.eventTrack.next({
      action: 'Click',
      properties: {
        category: 'Show/Hide Instructions',
      },
    });
  }

  selectInstruction(instr, i) {
    this.ngx_analytics.eventTrack.next({
      action: 'Click',
      properties: {
        category: 'Click on the instruction',
        label: `Instructions was pressed`,
      },
    });
    this.instructionListOpen = false;
    this.selectedInstructionIndex = i;
    this.currentInstr = instr.instructions;
    console.log(instr);
    this._mapbox.goToInstruction(instr);
  }

  nextInstruction() {
    this.ngx_analytics.eventTrack.next({
      action: 'Click',
      properties: {
        category: 'Next Instruction',
        label: 'Next Instruction button clicked',
      },
    });
    this.selectedInstructionIndex++;
    this.currentInstr = this.instructions[this.selectedInstructionIndex].instruction.instructions;
    this._mapbox.goToInstruction(
      this.instructions[this.selectedInstructionIndex].instruction
    );
  }

  prevInstruction() {
    this.ngx_analytics.eventTrack.next({
      action: 'Click',
      properties: {
        category: 'Prev Instruction',
        label: 'Prev Instruction button clicked',
      },
    });
    this.selectedInstructionIndex--;
    this.currentInstr = this.instructions[this.selectedInstructionIndex].instruction.instructions;
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
        this._mapbox.zoomToLinePoligon(this.allPath, [0, 150], 18, {
          top: 60,
          left: 60,
          right: 60,
          bottom: 60
        });
        setTimeout(() => {
          this.routing(res, currentInstr);
          currentInstr++;
        }, 2000);
        this.routeSubscribtion = this._mapbox.nextInstructionHandle.subscribe(() => {
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
      this.routeSubscribtion.unsubscribe();
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
    this.ngx_analytics.eventTrack.next({
      action: 'URL',
      properties: {
        category: 'URL of Current Page',
        label: window.location.pathname,
      },
    });
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
    this.applyImgsByVenueId = this.imgByVenueId[this.venueId];
  }

  ngAfterViewInit() {
    this._mapbox.initMap(this.venueId, true, true);
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
