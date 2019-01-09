import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { HomeComponent } from "./home.component";
import { HomeRoutingModule } from "./home-routing.module";
import { SharedModule } from '../../shared.module';


@NgModule({
  imports: [CommonModule, TranslateModule, HomeRoutingModule, SharedModule],
  declarations: [HomeComponent],
})
export class HomeModule {}
