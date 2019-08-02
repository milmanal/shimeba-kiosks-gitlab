import { Component, OnDestroy, HostListener } from '@angular/core';
import { DeviceService } from './services/device.service';
import { ErrorService } from './services/error.service';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppErrorModalComponent } from './components/error-modal/error.modal';
// import { AppSendSmsModalComponent } from './components/send-sms/send-sms.modal';
import { UserActionService } from './services/user-action.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  private ngUnsubscribe = new Subject();

  constructor(
    public ds: DeviceService,
    private _userActionService: UserActionService,
    private errorService: ErrorService,
    public _modalService: BsModalService
    ) {
      this.initializeErrors();
    }

    @HostListener('document:keyup', ['$event'])
    @HostListener('document:click', ['$event'])
    @HostListener('document:wheel', ['$event'])

    resetTimer() {
      this._userActionService.notifyUserAction();
    }

    ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }

    private initializeErrors() {
      this
        .errorService
        .getErrors()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((errors) => {
          this._modalService.show(AppErrorModalComponent, {
            class: 'error-modal-outer',
            ignoreBackdropClick: true,
            animated: true
          });
        });
    }
}
