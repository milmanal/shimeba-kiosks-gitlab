import {
  Component,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  AfterViewInit,
  ViewChild
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ApiService } from "../../../services/api.service";
import { DeviceService } from "./../../../services/device.service";

import { InstructionIcon } from "./../../../configs/instruction-icon";
import { Subscription, interval } from "rxjs";
import { LanguageService } from "../../../services/language.service";
import { MapboxService } from "../../../services/mapbox.service";

import { BsModalService, ModalDirective } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal/bs-modal-ref.service";
import { ToastrService } from 'ngx-toastr';
import { AppErrorModalComponent } from '../../../components/error-modal/error.modal';

@Component({
  selector: "direction-desktop",
  templateUrl: "desktop.component.html",
  styleUrls: ["desktop.component.scss"],
  encapsulation: ViewEncapsulation.None
})

export class DesktopComponent implements OnInit, AfterViewInit {
  kioskId: Number;
  poiId: Number;
  kioskData: any;
  poiData: any;
  poiLocation: any;
  instructions: any;
  routeLoaded: Boolean = false;
  languageSubscription: Subscription;
  initLanguage: any;
  routeSubscribtion: Subscription;
  modalRef: BsModalRef;
  phoneNumber: String = '';
  venueId: any;
  allPath: any = [];
  neededIstrType: any = [];
  applyImgsByVenueId: any;
  validationMessage: Boolean = false;
  ARRAY: any;
  layersCollection: Array<{}> = this._mapbox.getLayers();

  imgByVenueId = {
    '12': [
      'assets/imgs/start.svg',
      'assets/imgs/point.svg',
      'assets/imgs/route-dest.svg',
      'assets/imgs/destination-panel.svg',
      'assets/imgs/back-arrow.png',
      'assets/imgs/yafe/bullet.svg'
    ],

    '19': [
      'assets/imgs/yafe/start-yafe.svg',
      'assets/imgs/yafe/route-disk.svg',
      'assets/imgs/yafe/destination-reached.svg',
      'assets/imgs/yafe/destination-panel.png',
      'assets/imgs/yafe/back-arrow.svg',
      'assets/imgs/yafe/bullet.svg'
    ],

    '18': [
      'assets/imgs/hagalil/route-disk.svg',
      'assets/imgs/hagalil/route-disk.svg',
      'assets/imgs/hagalil/destination.svg',
      'assets/imgs/hagalil/destination.svg',
      'assets/imgs/yafe/back-arrow.svg',
      'assets/imgs/yafe/bullet.svg'
    ]
  };

  constructor(
    private _language: LanguageService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _mapbox: MapboxService,
    private _modalService: BsModalService,
    public ds: DeviceService,
    public toastr: ToastrService,
  ) {
    this._route.params.subscribe(params => {
      this.venueId = params.venueId;
      localStorage.setItem("kioskId", params.kioskId);
      localStorage.setItem("venueId", params.venueId);
      localStorage.setItem("langId", params.langId);
      this.kioskId = Number(params.kioskId);
      this.poiId = Number(params.poiId);

    });
  }

  showSuccess() {
    this.toastr.success('Success');
  }

  sendSms() {
    const sendParams = {
      text: window.location.href,
      recipientNumber: this.phoneNumber,
      senderName: 'Ichilov Hospital',
    };

    if (!sendParams.recipientNumber) {
      this.validationMessage = true;
      return this.validationMessage;
    }
    this.validationMessage = false;
    // this.phoneNumber = '';
    return this._api.sendSms(sendParams) && this.modalRef.hide();
  }

  enterNumber(number) {
    if (number === "del") {
      this.phoneNumber = this.phoneNumber.slice(0, -1);
    } else {
      this.phoneNumber += number;
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this._modalService.show(template, {
      class: "custom-modal"
    });

    if (this.venueId !== '12') {
      const smsModalIsOppened = document.getElementsByTagName('body');
      if (smsModalIsOppened.item(0).classList.contains('modal-open')) {
        smsModalIsOppened.item(0).classList.add('hide-darkness');
      }
    }
  }

  // openErrorModal() {
  //   const initialState = {
  //     list: [
  //       'Open a modal with component',
  //       'Pass your data',
  //       'Do something else',
  //       '...'
  //     ],
  //     title: 'Modal with component'
  //   };
  //   this.modalRef = this._modalService.show(AppErrorModalComponent, {
  //     class: 'error-modal-outer',
  //     ignoreBackdropClick: true,
  //     animated: true
  //   });
  //   // this.modalRef.content.closeBtnName = 'Ok';
  // }

  backToMain() {
    this.routeSubscribtion.unsubscribe();
    this._mapbox.clearMap();
    const kioskId = localStorage.getItem("kioskId");
    this._router.navigateByUrl(`/home/${this.venueId}/${kioskId}`);
  }

  getDirectionData() {
    let currentInstr = 0;
    let centeredRouteDependsOnDirection = [];
    if (this.venueId === '12') {
      centeredRouteDependsOnDirection = [300, 40];
    } else {
      centeredRouteDependsOnDirection = this.initLanguage.direction === 'rtl' ? [-300, -40] : [300, 40];
    }
    this._api.getDirection(this.kioskData, this.poiData,  this.venueId).subscribe(
      res => {
        this.instructions = res;
        let order = 'left';

        this.ARRAY = this.instructions.map(item => {
          if (
            item.instruction.instructionsType === 5 ||
            item.instruction.instructionsType === 6 ||
            item.instruction.instructionsType === 7 ||
            item.instruction.instructionsType === 8
          ) {
            order = order === 'left' ? 'right' : 'left';
            return {
              ...item,
              order
            };
          }
          return item;
        });
        this.routeLoaded = true;
        res.map(step => {
          step.points.map(poi => this.allPath.push(poi));
        });
        this._mapbox.zoomToLinePoligon(this.allPath, centeredRouteDependsOnDirection, 18.2, {
          top: 100,
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
      },
      error => {
        console.log(error, 'Err');
      }
    );
  }

  routing(instructions, currentInstr) {
    if (currentInstr === 0) {
      document
        .getElementsByClassName('instructions-container')[0]
        .classList.add('load-background');
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
      document
        .getElementById("sms-box")
        .setAttribute("style", "display: flex;");
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
    const venueId = localStorage.getItem("venueId");
    const HTML = document.getElementById("venue-container");
    const venueAttr = document.createAttribute("venueId");
    venueAttr.value = venueId;
    HTML.setAttributeNode(venueAttr);
    this.initLanguage = this._language.getCurrentLanguage();
    this.languageSubscription = this._language.observableLanguage.subscribe(
      lang => {
        if (this.initLanguage.name !== lang.name) {
          location.reload();
        }
      }
    );

    this.applyImgsByVenueId = this.imgByVenueId[venueId];
  }

  toggle(layer) {
    const serviceMap = this._mapbox.getMap();

    if (this._mapbox.isLayerVisible(layer)) {
      this._mapbox.hideLayers();
    } else {
      this._mapbox.hideLayers();
      if (!serviceMap.getLayer(layer.layerId)) {
        this._mapbox.addLayer(layer);
      } else {
        this._mapbox.displayLayer(layer);
      }
    }
  }

  ngAfterViewInit() {
    const urlString = window.location.href.includes('direction');
    this._mapbox.initMap(this.venueId, null, urlString);
    this._api
      .getKioskAndPoiData(this.kioskId, this.poiId)
      .subscribe(([kiosk, poi]) => {
        this.kioskData = kiosk;
        this.poiData = poi;

        if (poi.dynamicValues.length > 0) {
          this.poiLocation = poi.dynamicValues.filter(
            value => value.propertyName === "Location Description"
          );
        }
        this._mapbox.addMarker(
          "start-point",
          this.kioskData.entrances[0].sLongitude,
          this.kioskData.entrances[0].sLatitude
        );
        this.getDirectionData();
      });

  }
}
