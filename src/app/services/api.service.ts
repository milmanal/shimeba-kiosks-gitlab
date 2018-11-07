import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { LanguageService } from "./language.service";

import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/switchMap";
import "rxjs/Rx";
import { filter, map } from "rxjs/operators";
import { forkJoin } from "rxjs";

import { Poi } from "./../models";
@Injectable({
  providedIn: "root"
})
export class ApiService {
  url = "https://shimeba-api-staging.azurewebsites.net/api/";
  constructor(
    private _httpClient: HttpClient,
    private _language: LanguageService
  ) {}

  getKioskData(): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();
    const kioskId = localStorage.getItem("kioskId");

    return this._httpClient.get(
      `${this.url}pois/${kioskId}?locale=${currentLanguage.name}`
    );
  }

  search(terms: Observable<any>) {
    return terms
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => this.searchPoi(term));
  }

  searchPoi({value, venueId}) {
    const currentLanguage = this._language.getCurrentLanguage();

    return this._httpClient.get(
      `${this.url}pois?venueid=${venueId}&locale=${currentLanguage.name}&query=${value}`
    );
  }

  poiByCategory(categoryId, venueId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();

    return this._httpClient
      .get<Poi[]>(`${this.url}pois?venueid=${venueId}&locale=${currentLanguage.name}`)
      .map(res => res)
      .concatMap(res => Observable.from(res))
      .filter(poi => poi.categories.some(id => id === categoryId));
  }

  getKioskAndPoiData(kioskId, poiId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();
    return forkJoin(
      this._httpClient.get(
        `${this.url}pois/${kioskId}?locale=${currentLanguage.name}`
      ),
      this._httpClient.get(
        `${this.url}pois/${poiId}?locale=${currentLanguage.name}`
      )
    );
  }

  buildRoute(floor, instructions, pointsOfFloors, index?) {
    const instr = instructions;
    for (let i = 0; i < pointsOfFloors[floor].length; i++) {
      const poi = pointsOfFloors[floor][i];
      if (pointsOfFloors[floor][i].isShowInList) {
        if (instr[index]) {
          instr[index].points.push([
            Number(poi.longitude),
            Number(poi.latitude)
          ]);
        }
        index === undefined ? (index = 0) : index++;
        instr[index] = {
          instruction: poi,
          points: []
        };
      }
      if (instr[index]) {
        instr[index].points.push([Number(poi.longitude), Number(poi.latitude)]);
      }
      if (pointsOfFloors[floor][i].nextLevel) {
        this.buildRoute(
          pointsOfFloors[floor][i].nextLevel,
          instr,
          pointsOfFloors,
          index
        );
      }
    }
    return instr;
  }

  prebuildDirection(data) {
    const pointsOfFloors = data.pointsOfFloors;

    return this.buildRoute(data.source.level, [], pointsOfFloors);
  }

  getDirection(kioskData, poiData, venueId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();

    return this._httpClient
      .get(`${this.url}routing/byfloor`, {
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
      })
      .map(res => this.prebuildDirection(res));
  }
}
