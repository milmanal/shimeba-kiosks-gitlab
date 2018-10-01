import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
    url = 'https://shimeba-api-staging.azurewebsites.net/api/';
    constructor(
        private _httpClient: HttpClient,
        private _language: LanguageService
    ) { }

    getKioskData(): Observable<any> {
        const currentLanguage = this._language.getCurrentLanguage();
        const kioskId = localStorage.getItem('kioskId');

        return this._httpClient.get(`${this.url}pois/${kioskId}?locale=${currentLanguage.name}`);
    }
}
