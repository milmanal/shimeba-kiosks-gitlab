import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppLanguagePanelComponent } from './components/app-language-panel';

@NgModule({
 imports:      [ CommonModule ],
 declarations: [ AppLanguagePanelComponent ],
 exports:      [ AppLanguagePanelComponent ]
})
export class SharedModule { }
