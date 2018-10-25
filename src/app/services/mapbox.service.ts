import { Injectable } from "@angular/core";
import mapboxgl from "mapbox-gl";
@Injectable({
  providedIn: "root"
})
export class MapboxService {
  map;
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
  }

  addStartMarker(image, lon, lat) {
    this.map.addImage("start", document.getElementById('start-point'));
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
                coordinates: [lon, lat]
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
}
