import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, timer, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { UserActionService } from '../services/user-action.service';
import { Config } from '../configs/config';
import { MapboxService } from '../services/mapbox.service';
import { DeviceService } from '../services/device.service';
import { LanguageService } from '../services/language.service';

@Component({
    selector: 'app-inactivity-timer',
    template: ``,
    styles: []
})

export class AppInactivityTimerComponent implements OnDestroy, OnInit {
    endTime: number;
    reloadAppTime: number;
    unsubscribe$: Subject<void> = new Subject();
    timerSubscription: Subscription;
    timerLongInactivitySubscription: Subscription;
    currentLanguage: any;

    constructor(
        private _userActionService: UserActionService,
        public _mapbox: MapboxService,
        public _device: DeviceService,
        public _language: LanguageService
    ) { }

    ngOnInit() {
        const venueId = localStorage.getItem('venueId');
        this.reloadAppTime = Config[venueId].reloadAfterIncativity;
        this.endTime = !Config[venueId].inactivityDuration ? 40 : Config[venueId].inactivityDuration;
        this.resetTimer();
        this._userActionService.userActionOccured.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            if (this.timerSubscription || this.timerLongInactivitySubscription) {
                this.timerSubscription.unsubscribe();
                this.timerLongInactivitySubscription.unsubscribe();
            }

            this.resetTimer();
        });
    }

    resetTimer(endTime: number = this.endTime, reloadAppTime: number = this.reloadAppTime) {
        const interval = 1000;
        this.timerSubscription = timer(0, interval).pipe(
            take(endTime)
        ).subscribe(
            (value) => { },
            err => console.log('Error Occur ---> InactivityTimerComponent: ', err),
            () => {
                if (this._device.isMobile()) {
                    return;
                }

                if (window.location.href.includes('/direction')) {
                    this._mapbox.clearMap();
                }

                this._userActionService.goToMainScreen();
            }
        );

        this.timerLongInactivitySubscription = timer(0, interval).pipe(
            take(reloadAppTime)
        ).subscribe(
            (value) => { },
            err => console.log('Error Occur ---> InactivityTimerComponent: ', err),
            () => {
                if (this._device.isMobile()) {
                    return;
                }

                if (window.location.href.includes('/direction')) {
                    this._mapbox.clearMap();
                }

                this._userActionService.reloadApp();
            }
        );
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
