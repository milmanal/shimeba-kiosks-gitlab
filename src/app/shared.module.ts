import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppLanguagePanelComponent } from './components/app-language-panel';
import { LoaderComponent } from './components/loader';
import { AutofocusDirective } from './directives/autofocus.directive';
import { HighlightSearchPipe } from './pipes/highlight.pipe';

@NgModule({
 imports:      [ CommonModule ],
 declarations: [ AppLanguagePanelComponent, LoaderComponent, AutofocusDirective, HighlightSearchPipe ],
 exports:      [ AppLanguagePanelComponent, LoaderComponent, AutofocusDirective, HighlightSearchPipe ]
})
export class SharedModule { }
