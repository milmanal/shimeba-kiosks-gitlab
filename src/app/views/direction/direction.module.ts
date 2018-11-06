import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { DirectionComponent } from "./direction.component";
import { DirectionRoutingModule } from "./direction-routing.module";
import { FormsModule } from "@angular/forms";
import { DesktopComponent } from "./desktop/desktop.component";
import { MobileComponent } from "./mobile/mobile.component";

@NgModule({
  imports: [CommonModule, TranslateModule, FormsModule, DirectionRoutingModule],
  declarations: [DirectionComponent, DesktopComponent, MobileComponent],
  exports: [DesktopComponent, MobileComponent]
})
export class DirectionModule {}
