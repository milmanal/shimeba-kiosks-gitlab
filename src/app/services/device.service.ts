import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class DeviceService {
  constructor() {}

  isMobile() {
    return window.screen.availWidth <= 768;
  }

  isDesktop() {
    return window.screen.availWidth > 768;
  }
}
