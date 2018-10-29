import { Injectable } from "@angular/core";
import mapboxgl from "mapbox-gl";
import { InstructionIcon } from "./../configs/instruction-icon";
import turf from "turf";
import { interval } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class MapboxService {
  map;
  interval;
  geojson = {
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
  style = {
    version: 8,
    name: "Raster Tiles",
    sources: {
      customMap: {
        type: "raster",
        tiles: ["https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"],
        tileSize: 256
      },
      overlay: {
        type: "image",
        url: "assets/map_99_north.jpg",
        coordinates: [
          [34.791717138986535, 32.08206239285578],
          [34.79141068350503, 32.07787046370873],
          [34.78832531057368, 32.07803240327738],
          [34.78863176605523, 32.08222432499814]
        ]
      }
    },
    layers: [
      {
        id: "customMap",
        type: "raster",
        source: "customMap",
        paint: {
          "raster-fade-duration": 100
        }
      },
      {
        id: "overlay",
        source: "overlay",
        type: "raster",
        paint: {
          "raster-opacity": 0.85
        }
      }
    ]
  };

  constructor() {
    mapboxgl.accessToken = "undefined";
  }
  initMap() {
    this.map = new mapboxgl.Map({
      container: "map",
      zoom: 18,
      // pitch: 60,
      bearing: 93.5,
      center: [34.790005, 32.080043],
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
          "line-color": "#0277bd",
          "line-width": 10,
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
    const steps = 100;
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
    const time = 2000 / steps;
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
