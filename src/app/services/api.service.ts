import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, timer, forkJoin } from "rxjs";
import { LanguageService } from "./language.service";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/switchMap";
import { map } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import turf from "turf";

import { AppSuccessModalComponent } from "../components/success-modal/success.modal";
import { AppRestrictModalComponent } from "../components/restrict-modal/restrict.modal";

import { Poi } from "./../models";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

@Injectable({
  providedIn: "root"
})
export class ApiService {
  modalRef: BsModalRef;
  url = "https://shimeba-api.azurewebsites.net/api/";
  stagingUrl = "https://shimeba-api-staging.azurewebsites.net/api/";
  nextInstructionPosition = {};
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "text/plain"
    })
  };
  constructor(
    private _httpClient: HttpClient,
    private _language: LanguageService,
    private _modalService: BsModalService,
    public toastr: ToastrService
  ) {}

  getKioskData(): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();
    const kioskId = localStorage.getItem("kioskId");

    return this._httpClient.get(
      `${this.url}pois/${kioskId}?locale=${currentLanguage.name}`
    );
  }
  openSuccessModal() {
    this.modalRef = this._modalService.show(AppSuccessModalComponent, {
      class: "success-modal-outer",
      ignoreBackdropClick: true,
      animated: true
    });
    const source = timer(3000);
    return source.subscribe(() => this.modalRef.hide());
  }

  search(terms: Observable<any>) {
    return terms
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => this.searchPoi(term));
  }

  sendSms(params) {
    return this._httpClient
      .post(
        `${this.url}send/sms`,
        {},
        {
          headers: {
            "Content-Type": "text/plain"
          },
          params: params
        }
      )
      .subscribe(
        data => {
          return this.openSuccessModal();
        },
        error => {
          console.log(`Error:`, error);
        }
      );
  }

  searchPoi({ value, venueId }) {
    const currentLanguage = this._language.getCurrentLanguage();
    return this._httpClient.get(
      `${this.url}pois?venueid=${venueId}&locale=${currentLanguage.name}&query=${value}`
    );
  }

  // filterByCategory(pois, categoryId) {
  //   const poisByCategory = [];
  //   pois.map(poi => {
  //     if(poi.categories.some(id => id === categoryId)) {
  //       poisByCategory.push(poi);
  //     }
  //   })
  //   return poisByCategory;
  // }

  poiByCategory(categoryId, venueId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();

    return this._httpClient.get<Poi[]>(
      `${this.url}pois?categoryId=${categoryId}&venueid=${venueId}&locale=${currentLanguage.name}`
    );
  }

  poiByDistance(categoryId, venueId) {
    const currentLanguage = this._language.getCurrentLanguage();
    const kioskData = JSON.parse(localStorage.getItem("kioskData"));
    return this._httpClient.get<Poi[]>(`${this.url}pois/category/bydistance`, {
      params: {
        venueid: venueId,
        category: categoryId,
        lon: kioskData.longitude,
        lat: kioskData.latitude,
        level: kioskData.level,
        locale: currentLanguage.name,
        isParallel: "false"
      }
    });
  }

  getKioskAndPoiData(kioskId, poiId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();
    // const kioskId = localStorage.getItem('kioskId');
    const venueId = localStorage.getItem('venueId');
    return forkJoin(
      this._httpClient.get(
        `${this.url}pois/${kioskId}?locale=${currentLanguage.name}`
      ),
      this._httpClient.get(
        `${this.url}pois/${poiId}?kioskID=${kioskId}&venueID=${venueId}&locale=${currentLanguage.name}`
      )
    );
  }

  buildRoute(floor, instructions, pointsOfFloors, index?, prevFloor?) {
    const instr = instructions;
    for (
      let i = this.nextInstructionPosition[floor];
      i < pointsOfFloors[floor].length;
      i++
    ) {
      const poi = pointsOfFloors[floor][i];
      if (poi.isShowInList && poi.instructions) {
        if (instr[index]) {
          instr[index].points.push([
            Number(poi.longitude),
            Number(poi.latitude)
          ]);
        }
        index === undefined ? (index = 0) : index++;
        instr[index] = {
          instruction: poi,
          points: [],
          level: floor,
          isNextLevel: prevFloor !== undefined && prevFloor !== floor
        };
        prevFloor = floor;
      }
      
      if (instr[index]) {
        instr[index].points.push([Number(poi.longitude), Number(poi.latitude)]);
      }

      if (poi.nextLevel !== undefined) {
        this.nextInstructionPosition[floor] = i + 1;
        this.buildRoute(poi.nextLevel, instr, pointsOfFloors, index, floor);
        break;
      }
    }
    return instr;
  }

  prebuildDirection(data) {
    this.nextInstructionPosition = {};
    Object.keys(data.pointsOfFloors).map((el: string) => {
      this.nextInstructionPosition[el] = 0;
    });
    // const findOnlyVisibleInstructions = Object.keys(data.pointsOfFloors).map(
    //   arrays => {
    //     return data.pointsOfFloors[arrays].filter(
    //       element => element.isShowInList
    //     );
    //   }
    // );
    
    return this.buildRoute(data.source.level, [], data.pointsOfFloors);
  }

  getDirection(kioskData, poiData, venueId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();

    const source = this._httpClient.get(`${this.url}routing/byfloor`, {
      params: {
        lat1: kioskData.entrances[0].sLatitude,
        lon1: kioskData.entrances[0].sLongitude,
        level1: kioskData.entrances[0].level,
        venueid: venueId,
        lat2: poiData.entrances[0].sLatitude,
        lon2: poiData.entrances[0].sLongitude,
        level2: poiData.entrances[0].level,
        locale: currentLanguage.name,
        isForWidget: "true"
      }
    });
    return source.pipe(map(res => this.prebuildDirection(res)));
  }

  // getDirection(kioskData, poiData, venueId): Observable<any> {
  //   const currentLanguage = this._language.getCurrentLanguage();
  //   console.log(kioskData);
  //   console.log(poiData);

  //   const source = this._httpClient
  //     .get(`${this.url}routing/byfloor`, {
  //       params: {
  //         lat1: '32.45195315136141',
  //         lon1: '34.89711441099644',
  //         level1: '0',
  //         venueid: '18',
  //         lat2: '32.45194579544156',
  //         lon2: '34.89589065313339',
  //         level2: '0',
  //         locale: currentLanguage.name,
  //         isForWidget: 'true'
  //       }
  //     });
  //   return source.pipe(map(res => {
  //     console.log(this.prebuildDirection(res));
  //     return  this.prebuildDirection(res);
  //   }));
  // }
}
