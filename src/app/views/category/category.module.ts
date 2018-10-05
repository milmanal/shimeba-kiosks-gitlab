import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CategoryRoutingModule } from './category-routing.module';

import { CategoryComponent } from './category.component';

@NgModule({
  imports: [
    CommonModule,
    CategoryRoutingModule,
    TranslateModule
  ],
  providers: [],
  declarations: [CategoryComponent]
})
export class CategoryModule { }
