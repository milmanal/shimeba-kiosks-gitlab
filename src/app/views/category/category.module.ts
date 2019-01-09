import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { CategoryComponent } from "./category.component";
import { CategoryRoutingModule } from "./category-routing.module";
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [CommonModule, TranslateModule, CategoryRoutingModule, SharedModule],
  providers: [],
  declarations: [CategoryComponent]
})
export class CategoryModule {}
