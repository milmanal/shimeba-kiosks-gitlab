import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { LanguageService } from "./language.service";

import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/switchMap";
import "rxjs/Rx";
import { filter, map } from "rxjs/operators";
import { forkJoin } from 'rxjs';

import { Poi } from './../models';
@Injectable({
  providedIn: "root"
})
export class ApiService {
  url = "https://shimeba-api-staging.azurewebsites.net/api/";
  // routing/byfloor?lat1=32.0804542067765&lon1=34.7898267288336&level1=0&lat2=32.079351683968326&venueid=12&lon2=34.788963720202446&level2=-1&locale=he&isForWidget=true
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

  search(terms: Observable<string>) {
    return terms
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => this.searchPoi(term));
  }

  searchPoi(value) {
    const currentLanguage = this._language.getCurrentLanguage();

    return this._httpClient.get(
      `${this.url}pois?venueid=12&locale=${currentLanguage.name}&query=${value}`
    );
  }

  poiByCategory(categoryId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();

    return this._httpClient
      .get<Poi[]>(
        `${this.url}pois?venueid=12&locale=${currentLanguage.name}`
      )
      .map(res => res)
      .concatMap(res => Observable.from(res))
      .filter(poi => poi.categories.some(id => id === categoryId));
  }

  getKioskAndPoiData(kioskId, poiId): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();
    return forkJoin(
      this._httpClient.get(`${this.url}pois/${kioskId}?locale=${currentLanguage.name}`),
      this._httpClient.get(`${this.url}pois/${poiId}?locale=${currentLanguage.name}`)
    );
  }

  prebuildDirection(data) {
    const levels = Object.keys(data.pointsOfFloors);
    const instructions = {};
    // levels.map(level => {
    //   instructions[level] = data.pointsOfFloors[level].filter(poi => poi.isShowInList);
    // });
    
    levels.map(level => {
      data.pointsOfFloors[level].map(poi => {
        if(poi.isShowInList) {
          if(instructions[level] === undefined) {
            instructions[level] = [];
          } else {
            instructions[level][instructions[level].length - 1].route.push([
              Number(poi.longitude),
              Number(poi.latitude),
            ]);
          }
          instructions[level].push({
            instruction: poi,
            route: []
          })
        }
        instructions[level][instructions[level].length - 1].route.push([
          Number(poi.longitude),
          Number(poi.latitude),
        ]);
      })
    });
    
    return instructions;
  }

  getDirection(kioskData, poiData): Observable<any> {
    const currentLanguage = this._language.getCurrentLanguage();

    return this._httpClient.get(`${this.url}routing/byfloor`, {
      params: {
        lat1: kioskData.entrances[0].sLatitude,
        lon1: kioskData.entrances[0].sLongitude,
        level1: kioskData.entrances[0].level,
        venueid: '12',
        lat2: poiData.entrances[0].sLatitude,
        lon2: poiData.entrances[0].sLongitude,
        level2: poiData.entrances[0].level,
        locale: currentLanguage.name,
        isForWidget: 'true'
      }
    }).map(res => this.prebuildDirection(res));
  }
}
