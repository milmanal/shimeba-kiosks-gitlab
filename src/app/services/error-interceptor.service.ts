import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../services/error.service';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private errorService: ErrorService) {}
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).do(() => { }, (response) => {
            if (response instanceof HttpErrorResponse) {
                console.log('errorrrrrrrrr: ');
                if (response.status === 401) {
                    return;
                }

                if (response.status === 400 && response.error) {
                    this.errorService.addErrors(Array.isArray(response.error) ? response.error : [response.error]);
                    return;
                }

                this.errorService.addErrors([`Your generic error message`]);
            }

            return Observable.throw(response);
        });
    }
}
