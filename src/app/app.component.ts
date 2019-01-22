import { Component, OnDestroy, ViewChild } from "@angular/core";
import { DeviceService } from "./services/device.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  constructor(
    public ds: DeviceService,
    ) {}
}
