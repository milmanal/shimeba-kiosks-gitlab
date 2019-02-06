import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'highlight'
  })
export class HighlightSearchPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(value: any, args: any): any {
        const argsWithAvoidedSpacesAtTheBeginning = args.split(' ').filter(item => item !== '');

        if (!argsWithAvoidedSpacesAtTheBeginning[0]) {
            return value;
        }
        const re = new RegExp(argsWithAvoidedSpacesAtTheBeginning[0], 'gi');
        const match = value.match(re);

        if (!match) {
            return value;
        }

        const replacedValue = value.replace(re, `<mark class="highlighted">${match[0]}</mark>`);
        return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
    }
}
