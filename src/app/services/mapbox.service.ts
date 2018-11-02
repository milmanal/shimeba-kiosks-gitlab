import { Injectable } from "@angular/core";
import mapboxgl from "mapbox-gl";
import { InstructionIcon } from "./../configs/instruction-icon";
import turf from "turf";
import { interval, Subscription } from "rxjs";
import { Config } from "./../configs/config";

@Injectable({
  providedIn: "root"
})
export class MapboxService {
  venueId: any;
  map: any;
  interval: Subscription;
  geojson: any = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: []
        }
      }
    ]
  };
  style: Object;

  constructor() {
    mapboxgl.accessToken = "undefined";
    this.venueId = localStorage.getItem("venueId");
    this.style = {
      version: 8,
      name: "Raster Tiles",
      sources: {
        mainMap: {
          type: "raster",
          tiles: ["https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"],
          tileSize: 256
        },
        overlayMap: {
          type: "image",
          url: Config[this.venueId].initMapUrl,
          coordinates: Config[this.venueId].mapCorners
        }
      },
      layers: [
        {
          id: "mainMap",
          type: "raster",
          source: "mainMap",
          paint: {
            "raster-fade-duration": 100
          }
        },
        {
          id: "overlayMap",
          source: "overlayMap",
          type: "raster",
          paint: {
            "raster-opacity": 0.85
          }
        }
      ]
    };
  }
  initMap() {
    this.map = new mapboxgl.Map({
      container: "map",
      // pitch: 60,
      zoom: Config[this.venueId].initZoom,
      bearing: Config[this.venueId].rotation,
      center: Config[this.venueId].center,
      style: this.style
    });
    this.map.on("load", () => {
      this.map.addLayer({
        id: "lines",
        type: "line",
        source: {
          type: "geojson",
          data: this.geojson
        },
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": Config[this.venueId].routeLineColor,
          "line-width": Config[this.venueId].routeLineWidth,
          "line-opacity": 0.8
        }
      });
    });
  }

  clearMap() {
    if (this.interval) {
      this.interval.unsubscribe();
    }
    this.geojson.features[0].geometry.coordinates = [];
    this.map.getSource("lines").setData(this.geojson);
  }

  addRouteLine(coord) {
    const steps = 50;
    let arc = [];
    let currentGeojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coord
          }
        }
      ]
    };
    const lineDistance = turf.lineDistance(
      currentGeojson.features[0],
      "kilometers"
    );
    const time = (Config[this.venueId].timeForTheStep - 100) / steps;
    let currentI = 0;
    const currentInterval = interval(time);
    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
      let segment = turf.along(currentGeojson.features[0], i, "kilometers");
      arc.push(segment.geometry.coordinates);
    }
    const intervalSub = currentInterval.subscribe(() => {
      if (arc[currentI]) {
        this.geojson.features[0].geometry.coordinates.push(arc[currentI]);
        this.map.getSource("lines").setData(this.geojson);
        currentI++;
      } else {
        intervalSub.unsubscribe();
        console.log("done", new Date().getSeconds());
      }
    });
    this.interval = intervalSub;
  }

  addMarker(id, lon, lat) {
    this.map.addImage("start", document.getElementById(id));
    this.map.addLayer({
      id: "points",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [Number(lon), Number(lat)]
              }
            }
          ]
        }
      },
      layout: {
        "icon-image": "start",
        "icon-size": 1
      }
    });
  }

  addKioskMarker(lon, lat) {
    const youAreHere = document.getElementById("you-are-here");
    new mapboxgl.Marker(youAreHere, { offset: [-45, -75] })
      .setLngLat([lon, lat])
      .addTo(this.map);
  }

  addInstructionIcon(number, coord, instructionType) {
    const hasIcon = InstructionIcon.some(
      instruction => instruction.instructionType === instructionType
    );
    let markerEl;
    if (!hasIcon) {
      markerEl = document.createElement("div");
      markerEl.id = `marker${number}`;
      markerEl.classList.add("marker-number");
      markerEl.classList.add("d-flex");
      markerEl.classList.add("justify-content-center");
      markerEl.classList.add("align-items-center");

      const textNode = document.createTextNode(number);
      markerEl.appendChild(textNode);
    } else {
      markerEl = document.createElement("div");
      markerEl.id = `marker${number}`;
      markerEl.classList.add("marker-number");
      markerEl.classList.add("d-flex");
      markerEl.classList.add("justify-content-center");
      markerEl.classList.add("align-items-center");
      markerEl.classList.add("marker-number-icon");

      const textNode = document.createTextNode(number);
      markerEl.appendChild(textNode);

      const iconEl = document.createElement("img");
      const iconName = InstructionIcon.find(
        instruction => instruction.instructionType === instructionType
      ).icon;
      iconEl.src = `assets/imgs/${iconName}`;
      iconEl.classList.add("icon");
      markerEl.appendChild(iconEl);
    }
    new mapboxgl.Marker(markerEl).setLngLat(coord).addTo(this.map);
  }
  setDestinationMarker(lon, lat) {
    this.map.addImage(
      "destination-point-circle",
      document.getElementById("destination-point-circle")
    );
    this.map.addImage(
      "destination-point",
      document.getElementById("destination-point")
    );
    this.map.addLayer({
      id: "destination-circle",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [Number(lon), Number(lat)]
              }
            }
          ]
        }
      },
      layout: {
        "icon-image": "destination-point-circle",
        "icon-size": 1,
        "icon-allow-overlap": true
      }
    });
    this.map.addLayer({
      id: "destination-point",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [Number(lon), Number(lat)]
              }
            }
          ]
        }
      },
      layout: {
        "icon-image": "destination-point",
        "icon-size": 1,
        "icon-offset": [3, 5],
        "icon-anchor": "bottom"
      }
    });
  }
}
