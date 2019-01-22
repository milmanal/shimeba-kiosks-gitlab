import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()

export class ErrorService {
    private errors = new Subject<string[]>();

    constructor() { }

    public addErrors = (errors: string[]): void =>
        this.errors.next(errors)

    public getErrors = () =>
        this.errors.asObservable()
}
