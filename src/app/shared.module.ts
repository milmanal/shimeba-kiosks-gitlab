import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppLanguagePanelComponent } from './components/app-language-panel';
import { LoaderComponent } from './components/loader';

@NgModule({
 imports:      [ CommonModule ],
 declarations: [ AppLanguagePanelComponent, LoaderComponent ],
 exports:      [ AppLanguagePanelComponent, LoaderComponent ]
})
export class SharedModule { }
