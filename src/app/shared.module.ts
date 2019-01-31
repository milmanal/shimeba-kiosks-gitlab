import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppLanguagePanelComponent } from './components/app-language-panel';
import { LoaderComponent } from './components/loader';
import { AutofocusDirective } from './directives/autofocus.directive';


@NgModule({
 imports:      [ CommonModule ],
 declarations: [ AppLanguagePanelComponent, LoaderComponent, AutofocusDirective ],
 exports:      [ AppLanguagePanelComponent, LoaderComponent, AutofocusDirective ]
})
export class SharedModule { }
