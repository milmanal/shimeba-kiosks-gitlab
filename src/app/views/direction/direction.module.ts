import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { DirectionRoutingModule } from './direction-routing.module';

import { DirectionComponent } from './direction.component';

@NgModule({
  imports: [
    CommonModule,
    DirectionRoutingModule,
    TranslateModule
  ],
  declarations: [DirectionComponent]
})
export class DirectionModule { }
