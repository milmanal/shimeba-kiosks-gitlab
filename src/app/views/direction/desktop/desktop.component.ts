import {
  Component,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { DeviceService } from './../../../services/device.service';

import { InstructionIcon } from './../../../configs/instruction-icon';
import { Subscription, interval, timer, Subject } from 'rxjs';
import { LanguageService } from '../../../services/language.service';
import { MapboxService } from '../../../services/mapbox.service';
import { AppErrorModalComponent } from '../../../components/error-modal/error.modal';
import { AppRestrictModalComponent } from '../../../components/restrict-modal/restrict.modal';

import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AppSendSmsModalComponent } from '../../../components/send-sms';
import { Config } from '../../../configs/config';
import { NgxAnalytics } from 'ngx-analytics';
import { ErrorService } from '../../../services/error.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'direction-desktop',
  templateUrl: 'desktop.component.html',
  styleUrls: ['desktop.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesktopComponent implements OnInit, AfterViewInit, OnDestroy {
  kioskId: Number;
  poiId: Number;
  kioskData: any;
  currentKioskData: any;
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
  pathsArranged: any = [];
  neededIstrType: any = [];
  applyImgsByVenueId: any;
  validationMessage: Boolean = false;
  ARRAY: any;
  levels: any;
  layersCollection: Array<{}> = this._mapbox.getLayers();
  subscribeSmsModal: any;
  modal: any;
  dynamicSmsIcon: String;

  private ngUnsubscribe = new Subject();
  hideInstructionOnModalOpen = false;
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
    ],

    '20': [
      'assets/imgs/ziv/route-disk.svg',
      'assets/imgs/ziv/route-disk.svg',
      'assets/imgs/ziv/destination-ziv.svg',
      'assets/imgs/ziv/destination-ziv.svg',
      'assets/imgs/yafe/back-arrow.svg',
      'assets/imgs/yafe/bullet.svg'
    ],
    '27': [
      'assets/imgs/ziv/route-disk.svg',
      'assets/imgs/ziv/route-disk.svg',
      'assets/imgs/ziv/destination-ziv.svg',
      'assets/imgs/ziv/destination-ziv.svg',
      'assets/imgs/yafe/back-arrow.svg',
      'assets/imgs/yafe/bullet.svg'
    ],
    '24': [
      'assets/imgs/poria/route-disk.svg',
      'assets/imgs/poria/route-disk.svg',
      'assets/imgs/poria/destination-ziv.svg',
      'assets/imgs/poria/destination-ziv.svg',
      'assets/imgs/yafe/back-arrow.svg',
      'assets/imgs/poria/bullet.svg'
    ],
    '25': [
      'assets/imgs/barzilay/start.svg',
      'assets/imgs/barzilay/route-disk.svg',
      'assets/imgs/barzilay/dest-panel.svg',
      'assets/imgs/barzilay/dest-panel.svg',
      'assets/imgs/barzilay/back-arrow.svg',
      'assets/imgs/barzilay/bullet.svg'
    ],
  };

  constructor(
    private ngx_analytics: NgxAnalytics,
    private _language: LanguageService,
    private _route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _mapbox: MapboxService,
    private _modalService: BsModalService,
    public ds: DeviceService,
    private errorService: ErrorService
  ) {
    this.initializeErrors();
    this._route.params.subscribe(params => {
      this.venueId = params.venueId;
      localStorage.setItem('kioskId', params.kioskId);
      localStorage.setItem('venueId', params.venueId);
      localStorage.setItem('langId', params.langId);
      this.kioskId = Number(params.kioskId);
      this.poiId = Number(params.poiId);
      const bodyTag = document.getElementsByTagName('body')[0];
      const venueAttr = document.createAttribute('venueId');
      venueAttr.value = this.venueId;
      bodyTag.setAttributeNode(venueAttr);
    });
    this.dynamicSmsIcon = `assets/imgs/sms-icon/${this.venueId}.svg`;
  }

  initializeErrors() {
    this.errorService
      .getErrors()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(errors => {
        this.modal = this._modalService.show(AppErrorModalComponent, {
          class: 'error-modal-outer',
          ignoreBackdropClick: true,
          animated: true
        });
      });
  }

  openModal() {
    this.ngx_analytics.eventTrack.next({
      action: 'SMS Modal Appear',
      properties: {
        category: 'SMS Modal'
      }
    });
    this.modal = this._modalService.show(AppSendSmsModalComponent, {
      class: `custom-modal zoomInUp custom-modal-${this.venueId}`,
      ignoreBackdropClick: this.venueId === '25' ? false : true,
      animated: true
    });

    if (Config[this.venueId].hideInstructionOnModalOpen) {
      this.hideInstructionOnModalOpen = true;
      this.modal.content.onClose.subscribe(result => {
        this.hideInstructionOnModalOpen = false;
      });
    }

    if (this.venueId !== '12') {
      const smsModalIsOppened = document.getElementsByTagName('body');
      if (smsModalIsOppened.item(0).classList.contains('modal-open')) {
        smsModalIsOppened.item(0).classList.add('hide-darkness');
      }
    }
  }

  backToMain() {
    this.ngx_analytics.eventTrack.next({
      action: 'Click on Back button from the Direction screen',
      properties: {
        category: 'Back Button',
        label: `Back to Main Screen`
      }
    });
    if (this.routeSubscribtion) {
      this.routeSubscribtion.unsubscribe();
    }
    this._mapbox.clearMap();
    const kioskId = localStorage.getItem('kioskId');
    const langId = localStorage.getItem('langId');
    this._router.navigateByUrl(`/home/${this.venueId}/${kioskId}/${langId}`);
  }
  generateInstructions(data, level, index) {
    console.log('generateInstructions', data, level, index);
    
    for (let i = index; i < this.instructions[level].length; i++) {
      // @ts-ignore
      const instruction = this.instructions[level][i];
      data.push({
        ...instruction,
        // @ts-ignore
        isNextLevel: (i == 0 && level > 0),
        level: level
      });
      this.levels[level]++;
      if (instruction.nextLevel !== null && instruction.nextLevel >= 0) {
        data = this.generateInstructions(data, instruction.nextLevel, this.levels[instruction.nextLevel]);
        return data;
      }
    }
    return data;
  }
  getDirectionData() {
    let currentInstr = 0;
    let centeredRouteDependsOnDirection = [];
    if (this.venueId === '12') {
      centeredRouteDependsOnDirection = [300, 40];
    } else {
      centeredRouteDependsOnDirection =
        this.initLanguage.direction === 'rtl' ? [-300, -40] : [300, 40];
    }
    this._api
      .getDirection(this.kioskData, this.poiData, this.venueId)
      .subscribe(
        res => {
          this.instructions = res;
          let order = "left";
          this.currentKioskData = JSON.parse(localStorage.getItem("kioskData"));
          this.ARRAY = this.instructions.map(item => {
            if (
              item.instruction.instructionsType === 5 ||
              item.instruction.instructionsType === 6 ||
              item.instruction.instructionsType === 7 ||
              item.instruction.instructionsType === 8
            ) {
              order = order === "left" ? "right" : "left";
              return {
                ...item,
                order,
                icon: this.getIconByInstructionType(item.instruction.instructionsType)
              };
            }
            return item;
          });
          console.log(this.ARRAY);
          
          this.routeLoaded = true;
          res.map(step => {
            step.points.map(poi => this.allPath.push(poi));
          });
          this._mapbox.zoomToLinePoligon(
            this.allPath,
            centeredRouteDependsOnDirection,
            18,
            {
              top: 100,
              left: 60,
              right: 60,
              bottom: 60
            }
          );
          setTimeout(() => {
            this.routing(res, currentInstr);
            currentInstr++;
          }, 2000);
          this.routeSubscribtion = this._mapbox.nextInstructionHandle.subscribe(
            () => {
              this.routing(res, currentInstr);
              currentInstr++;
            }
          );
        },
        error => {
          console.log(error, "Err");
        }
      );
  }
  routing(instructions, currentInstr) {
    return new Promise((res, rej) => {
      if (currentInstr === 0) {
        document
          .getElementsByClassName('instructions-container')[0]
          .classList.add('load-background');
        document
          .getElementById('start-instr')
          .setAttribute('style', 'display: block');
      }
      
      if (instructions[currentInstr]) {
        const idToFind = instructions[currentInstr].instruction ?
          instructions[currentInstr].instruction.instructions + currentInstr :
          'level' + instructions[currentInstr].level + currentInstr;
        const instruction = document.getElementById(idToFind);
        this._mapbox.addRouteLine(instructions[currentInstr].points);
        if (instruction) {
          instruction.setAttribute('style', 'display: block');
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
          .getElementById('destination-instr')
          .setAttribute('style', 'display: block');
        document
          .getElementById('sms-box')
          .setAttribute('style', 'display: flex;');

        this._mapbox.setDestinationMarker(
          this.poiData.entrances[0].longitude,
          this.poiData.entrances[0].latitude
        );

        const smsModalTimeAppearing = timer(
          Config[this.venueId].smsModalTimeAppearing
        );

        this.subscribeSmsModal = smsModalTimeAppearing.subscribe(val => {
          if (!window.location.href.includes('/direction') || !!this.modal) {
            return false;
          }

          this.openModal();
        });

        this.routeSubscribtion.unsubscribe();
        res();
      }
    });

    // TODO functionality where you can add some classes to elements what are close to each other after
    // they were rendered

    // .then(res => {
    //   const markers = document.querySelectorAll(".marker-number");
    //   const markersLength = Object.keys(markers).length;

    //   for (let i = 0; i < markersLength - 1; i++) {
    //     if (i + 1 < markersLength) {
    //       const currentBCR = markers[i].getBoundingClientRect();
    //       const nextBCR = markers[i + 1].getBoundingClientRect();
    //       const currentOffsetTop = currentBCR.top;
    //       const currentOffsetLeft = currentBCR.left;
    //       const nextOffsetTop = nextBCR.top;
    //       const nextOffsetLeft = nextBCR.left;
    //       const pushToLeft = currentOffsetLeft - nextOffsetLeft < 130;
    //       const xIsNegative = currentOffsetLeft - nextOffsetLeft > 130;
    //       const yIsPositive = currentOffsetTop - nextOffsetTop > 130;
    //       const pushToTop = currentOffsetTop - nextOffsetTop < 130;
    //       if (pushToLeft) {
    //         markers[i].classList.add("pushToLeft");
    //       }
    //       if (pushToTop) {
    //         markers[i].classList.add("pushToTop");
    //       }
    //     }
    //   }
    // })
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
        label: window.location.pathname
      }
    });
    const venueId = localStorage.getItem('venueId');
    const HTML = document.getElementById('venue-container');
    const venueAttr = document.createAttribute('venueId');
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

        if (poi.responseMessage && poi.responseMessage.length) {
          this.modal = this._modalService.show(AppRestrictModalComponent, {
            initialState: {
              message: poi.responseMessage
            },
            class: 'restrict-modal-outer',
            ignoreBackdropClick: true,
            animated: true
          });

          return;
        }

        if (poi.dynamicValues.length > 0) {
          this.poiLocation = poi.dynamicValues.filter(
            value => value.propertyName === 'Location Description'
          );
        }

        if (this.poiData.entrances.length) {
          const pointAppearing = timer(300);
          pointAppearing.subscribe(val => {
            this._mapbox.addMarker(
              'start-point',
              this.kioskData.entrances[0].sLongitude,
              this.kioskData.entrances[0].sLatitude
            );
          });
          this.getDirectionData();
        } else {
          this._modalService.show(AppErrorModalComponent, {
            class: 'error-modal-outer',
            ignoreBackdropClick: true,
            animated: true
          });
        }
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscribeSmsModal) {
      this.subscribeSmsModal.unsubscribe();
    }
    if (this.modal) {
      this.modal.hide();
    }
  }
}
