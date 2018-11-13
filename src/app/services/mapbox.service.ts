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
  isMobile: Boolean;
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
  }
  initMap(venueId, isMobile?: Boolean, isDirection?: Boolean) {
    this.isMobile = isMobile;
    this.venueId = venueId;
    this.style = {
      version: 8,
      name: "Raster Tiles",
      sources: {
        overlayMap: {
          type: "image",
          url: isDirection
            ? Config[this.venueId].directionMapUrl
            : Config[this.venueId].homeMapUrl,
          coordinates: Config[this.venueId].mapCorners
        }
        // mainMap: {
        //   type: "raster",
        //   tiles: ["https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"],
        //   tileSize: 256
        // },
      },
      layers: [
        // {
        //   id: "mainMap",
        //   type: "raster",
        //   source: "mainMap",
        //   paint: {
        //     "raster-fade-duration": 100
        //   }
        // },
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
    this.map = new mapboxgl.Map({
      container: "map",
      // pitch: 60,
      zoom: isMobile
        ? Config[this.venueId].mobileInitZoom
        : Config[this.venueId].initZoom,
      bearing: Config[this.venueId].rotation,
      center: Config[this.venueId].center,
      style: this.style
    });
    this.map.on("load", () => {
      this.map.addLayer({
        id: "secondary-line",
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
          "line-color": Config[this.venueId].borderLineColor,
          "line-width": isMobile
            ? (Config[this.venueId].routeLineWidth +
                Config[this.venueId].borderLineWidth) /
              1.5
            : Config[this.venueId].routeLineWidth +
              Config[this.venueId].borderLineWidth
        }
      });
      this.map.addLayer({
        id: "main-line",
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
          "line-width": isMobile
            ? Config[this.venueId].routeLineWidth / 1.5
            : Config[this.venueId].routeLineWidth
        }
      });
    });
  }

  clearMap() {
    if (this.interval) {
      this.interval.unsubscribe();
    }
    this.geojson.features[0].geometry.coordinates = [];
    this.map.getSource("main-line").setData(this.geojson);
    this.map.getSource("secondary-line").setData(this.geojson);
  }

  steps: any = 100;
  arc = [];
  currentGeojson = {
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
  lineDistance: any;
  currentI = 0;

  addRouteLine(coord) {
    this.currentGeojson.features[0].geometry.coordinates = coord;
    this.lineDistance = turf.lineDistance(
      this.currentGeojson.features[0],
      "kilometers"
    );
    for (
      let i = 0;
      i < this.lineDistance;
      i += this.lineDistance / this.steps
    ) {
      let segment = turf.along(
        this.currentGeojson.features[0],
        i,
        "kilometers"
      );
      this.arc.push(segment.geometry.coordinates);
    }
    this.animateRoute();
  }

  animateRoute() {
    if(this.arc[this.currentI]) {
      this.geojson.features[0].geometry.coordinates.push(this.arc[this.currentI]);
      this.map.getSource("main-line").setData(this.geojson);
      this.map.getSource("secondary-line").setData(this.geojson);
    }
    this.currentI++;
    if (this.currentI < this.steps) {
      requestAnimationFrame(this.animateRoute.bind(this));
    } else {
      this.currentI = 0;
      this.lineDistance = 0;
      this.currentGeojson.features[0].geometry.coordinates = [];
      this.arc = [];
    }
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
        "icon-size": this.isMobile ? 1 / 1.5 : 1
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
        "icon-size": this.isMobile ? 1 / 1.5 : 1,
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
        "icon-size": this.isMobile ? 1 / 1.5 : 1,
        "icon-offset": [3, 5],
        "icon-anchor": "bottom"
      }
    });
  }

  zoomToLinePoligon(coordinates, offset?) {
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    this.fitBoundsRotated(bounds, {
      padding: 60,
      offset: offset || [0, 0],
      bearing: Config[this.venueId].rotation,
      maxZoom: 18
    });
  }

  fitBoundsRotated(bounds, options) {
    options = Object.assign(
      {
        padding: {
          top: 0,
          bottom: 0,
          right: 0,
          left: 0
        },
        offset: [0, 0],
        maxZoom: this.map.transform.maxZoom
      },
      options
    );

    if (typeof options.padding === "number") {
      const p = options.padding;
      options.padding = {
        top: p,
        bottom: p,
        right: p,
        left: p
      };
    }

    bounds = mapboxgl.LngLatBounds.convert(bounds);

    const paddingOffset = [
        options.padding.left - options.padding.right,
        options.padding.top - options.padding.bottom
      ],
      lateralPadding = Math.min(options.padding.right, options.padding.left),
      verticalPadding = Math.min(options.padding.top, options.padding.bottom);
    options.offset = [
      options.offset[0] + paddingOffset[0],
      options.offset[1] + paddingOffset[1]
    ];

    options.bearing = options.bearing || this.map.getBearing();

    const offset = mapboxgl.Point.convert(options.offset),
      tr = this.map.transform,
      nw = tr.project(bounds.getNorthWest()),
      se = tr.project(bounds.getSouthEast()),
      size = se.sub(nw);

    /** START CUSTOM ROTATION HACK **/
    // Now using a "cropped rectangle" rotation method
    // https://stackoverflow.com/questions/33866535/how-to-scale-a-rotated-rectangle-to-always-fit-another-rectangle
    // W = w·|cos φ| + h·|sin φ|
    // H = w·|sin φ| + h·|cos φ|
    const theta = options.bearing * (Math.PI / 180),
      W =
        size.x * Math.abs(Math.cos(theta)) + size.y * Math.abs(Math.sin(theta)),
      H =
        size.x * Math.abs(Math.sin(theta)) + size.y * Math.abs(Math.cos(theta)),
      rotatedSize = { x: W, y: H },
      /** END CUSTOM ROTATION HACK **/

      scaleX =
        (tr.width - lateralPadding * 2 - Math.abs(offset.x) * 2) /
        rotatedSize.x,
      scaleY =
        (tr.height - verticalPadding * 2 - Math.abs(offset.y) * 2) /
        rotatedSize.y;

    if (scaleY < 0 || scaleX < 0) {
      if (typeof console !== "undefined")
        console.warn(
          "Map cannot fit within canvas with the given bounds, padding, and/or offset."
        );
      return this;
    }

    options.center = tr.unproject(nw.add(se).div(2));
    options.zoom = Math.min(
      tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)),
      options.maxZoom
    );

    return options.linear ? this.map.easeTo(options) : this.map.flyTo(options);
  }

  goToInstruction(instruction) {
    const coordinates = [instruction.longitude, instruction.latitude];
    this.map.easeTo({
      center: coordinates,
      zoom: 18
    });
  }
}
