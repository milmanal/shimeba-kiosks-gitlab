import { Component, OnDestroy } from '@angular/core';
import { DeviceService } from './services/device.service';
import { ErrorService } from './services/error.service';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppErrorModalComponent } from './components/error-modal/error.modal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  private ngUnsubscribe = new Subject();

  constructor(
    public ds: DeviceService,
    private errorService: ErrorService,
    public _modalService: BsModalService
    ) {
      this.initializeErrors();
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
