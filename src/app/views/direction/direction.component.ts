import {
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { DeviceService } from "./../../services/device.service";

@Component({
  templateUrl: "direction.component.html",
  styleUrls: ["direction.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class DirectionComponent {
  constructor(public ds: DeviceService) {}
}
