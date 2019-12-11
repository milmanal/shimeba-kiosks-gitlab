import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { InstructionIcon } from './../configs/instruction-icon';
import turf from 'turf';
import { Subscription, Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operator/map';
import { Config } from './../configs/config';
import { LayersConfig } from './../configs/layers.config';

interface Layer {
  layerId: string;
  layerName: string;
  layerImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  venueId: any;
  map: any;
  markerEl: any;
  interval: Subscription;
  isMobile: Boolean;
  geojson: any = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    ]
  };
  style: Object;
  nextInstruction: Observer<any>;
  arc = [];
  currentRouteStepGeojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    ]
  };
  lineDistance: any;
  currentRouteStepIndex = 0;
  _activeLayer: Layer = {
    layerId: null,
    layerName: null,
    layerImage: null,
  };

  times = [];
  fps: any;
  steps = 0;
  nextInstructionHandle = Observable.create((observer) => {
    this.nextInstruction = observer;
  });

  constructor() {
    mapboxgl.accessToken = 'undefined';
  }

  initMap(venueId, isMobile?: Boolean, isDirection?: Boolean) {
    this.isMobile = isMobile;
    this.venueId = venueId;
    this.style = {
      version: 8,
      name: 'Raster Tiles',
      sources: {
        overlayMap: {
          type: 'image',
          url: isDirection
            ? Config[this.venueId].directionMapUrl
            : Config[this.venueId].homeMapUrl,
          coordinates: Config[this.venueId].mapCorners
        }
      },
      layers: [
        {
          id: 'overlayMap',
          source: 'overlayMap',
          type: 'raster',
          paint: {
            'raster-opacity': 1
          }
        }
      ]
    };

    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      minZoom: 1,
      // pitch: 60,
      zoom: isMobile
        ? Config[this.venueId].mobileInitZoom
        : Config[this.venueId].initZoom,
      bearing: Config[this.venueId].rotation,
      center: Config[this.venueId].center,
    });


    this.map.on('load', () => {
      this.map.addLayer({
        id: 'secondary-line',
        type: 'line',
        source: {
          type: 'geojson',
          data: this.geojson
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': Config[this.venueId].borderLineColor,
          'line-width': isMobile
            ? (Config[this.venueId].routeLineWidth +
                Config[this.venueId].borderLineWidth) /
              1.5
            : Config[this.venueId].routeLineWidth +
              Config[this.venueId].borderLineWidth,
        }
      });
      this.map.addLayer({
        id: 'main-line',
        type: 'line',
        source: {
          type: 'geojson',
          data: this.geojson
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': Config[this.venueId].routeLineColor,
          'line-width': isMobile
            ? Config[this.venueId].routeLineWidth / 1.5
            : Config[this.venueId].routeLineWidth,
        }
      });
      this.map.loadImage(Config[this.venueId].arrowOnRouteUrl, (error, image) => {
        if (error) {
          throw error;
        }
        this.map.addImage('chevron', image);
        this.map.addLayer({
            'id': 'arrows',
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [0, 0]
                        }
                    }]
                }
            },
            'layout': {
              'symbol-placement': 'line',
              'symbol-spacing': isMobile ? 30 : 42,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-rotation-alignment': 'map',
              'icon-image': 'chevron',
              'icon-size': .5,
              'icon-anchor': 'center'
            }
        });
      });

      // this.animateRoute();
    });

  }

  clearMap() {
    if (this.interval) {
      this.interval.unsubscribe();
    }
    this.geojson.features[0].geometry.coordinates = [];
    if (this.map) {
      this.map.removeLayer('overlayMap');
      this.map.removeSource('overlayMap');
      this.map.remove();
    }
    this.markerEl = null;
    this.mergeInstructionsWithImage = false;
  }

  addRouteLine(coord) {
    this.steps = !localStorage.getItem('fps') ? 60 : (+localStorage.getItem('fps') * Config[this.venueId].drawTime);
    this.currentRouteStepGeojson.features[0].geometry.coordinates = coord;

    this.lineDistance = turf.lineDistance(
      this.currentRouteStepGeojson.features[0],
      'kilometers'
    );

    if (this.lineDistance >= 0) {
      requestAnimationFrame(this.animateRoute.bind(this));

      for (
        let i = 0;
        i < this.lineDistance;
        i += this.lineDistance / this.steps
      ) {
        const segment = turf.along(
          this.currentRouteStepGeojson.features[0],
          i,
          'kilometers'
        );
        this.arc.push(segment.geometry.coordinates);
      }
    } else {
      setTimeout(() => {
        this.nextInstruction.next(null);
      }, 2000);
    }
  }

  animateRoute() {
    const now = performance.now();
    while (this.times.length > 0 && this.times[0] <= now - 1000) {
      this.times.shift();
    }
    this.times.push(now);
    this.fps = this.times.length;

    if (this.arc[this.currentRouteStepIndex]) {
      this.geojson.features[0].geometry.coordinates.push(
        this.arc[this.currentRouteStepIndex]
      );
      if (this.venueId === '12' ) {
        this.map.getSource('main-line').setData(this.geojson);
        this.map.getSource('secondary-line').setData(this.geojson);
        this.map.getSource('arrows').setData(this.geojson);
      } else {
        this.map.getSource('main-line').setData(this.geojson);
        this.map.getSource('arrows').setData(this.geojson);
      }
    }
    this.currentRouteStepIndex++;
    if (this.currentRouteStepIndex < this.steps) {
      requestAnimationFrame(this.animateRoute.bind(this));
    } else {
      localStorage.setItem('fps', this.fps);
      this.currentRouteStepIndex = 0;
      this.lineDistance = 0;
      this.currentRouteStepGeojson.features[0].geometry.coordinates = [];
      this.arc = [];
      this.nextInstruction.next(null);
    }
  }

  addMarker(id, lon, lat) {

    this.map.addImage('start', document.getElementById(id));
    this.map.addLayer({
      id: 'points',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [Number(lon), Number(lat)]
              }
            }
          ]
        }
      },
      layout: {
        'icon-image': 'start',
        'icon-size': this.isMobile ? 1 / 1.5 : 1
      }
    });
  }

  addKioskMarker(lon, lat, offset: number[]) {
    const youAreHere = document.getElementById('you-are-here');
    new mapboxgl.Marker(youAreHere, { offset: offset })
      .setLngLat([lon, lat])
      .addTo(this.map);
  }


  arePointsNear(coord) {
    // console.log(coord);
    const sw = new mapboxgl.LngLat(coord[0] + 0.005, coord[1] + 0.005);
    const ne = new mapboxgl.LngLat(coord[0] - 0.005, coord[1] - 0.005);
    const bounds = new mapboxgl.LngLatBounds(sw, ne);

    // console.log(bounds._sw);
    // if (bounds.includes(point1)) {
    //   return true;
    // }
    // return false;
  }

  prevDistance: any;
  mergeInstructionsWithImage = false;

  addInstructionIcon(number, coord, instructionType) {
    this.arePointsNear(coord);
    const hasIcon = InstructionIcon.some(
      instruction => instruction.instructionType === instructionType
    );
    const instructions = document.getElementsByClassName('instruction-number');
    if (!hasIcon) {
      if (!this.markerEl) {
        this.prevDistance = this.lineDistance;
        this.markerEl = document.createElement('div');
        this.markerEl.id = `marker${number}`;
        this.markerEl.classList.add('marker-number');
        this.markerEl.classList.add('d-flex');
        this.markerEl.classList.add('justify-content-around');
        this.markerEl.classList.add('align-items-center');
        this.markerEl.innerHTML = `<span class="child">${number}</span>`;
      } else if (this.prevDistance <= 0.020 || this.mergeInstructionsWithImage) {
          this.markerEl.innerHTML += `<span class="child">${number}</span>`;
          this.markerEl.classList.add('multi-instructions');
          this.prevDistance = this.lineDistance;
      } else {
          this.markerEl = document.createElement('div');
          this.markerEl.id = `marker${number}`;
          this.markerEl.classList.add('marker-number');
          this.markerEl.classList.add('d-flex');
          this.markerEl.classList.add('justify-content-around');
          this.markerEl.classList.add('align-items-center');
          this.markerEl.innerHTML = `<span class="child">${number}</span>`;
      }
    } else {

      if (this.prevDistance <= 0.020) {
        const styles = `
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: row-reverse;
        `;
        let childDiv = `
          <div style="${styles}" class="child">
            <span>${number}</span>
        `;

        const prevHtml = this.markerEl.innerHTML;
        this.markerEl.innerHTML += childDiv;

        const iconEl = document.createElement('img');
        const iconName = InstructionIcon.find(
          instruction => instruction.instructionType === instructionType
        ).icon;
        iconEl.src = `assets/imgs/${iconName}`;
        iconEl.classList.add('icon');
        childDiv += `
          ${iconEl.outerHTML}
          </div>
        `;
        this.markerEl.innerHTML = (`${prevHtml} ${childDiv}`);
        this.mergeInstructionsWithImage = true;
      } else {
        this.markerEl = document.createElement('div');
        this.markerEl.id = `marker${number}`;
        this.markerEl.classList.add('marker-number');
        this.markerEl.classList.add('d-flex');
        this.markerEl.classList.add('justify-content-around');
        this.markerEl.classList.add('align-items-center');
        this.markerEl.classList.add('marker-number-icon');
        const styles = `
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: row-reverse;
        `;
        let childDiv = `
          <div style="${styles}" class="child">
            <span>${number}</span>
        `;

        const prevHtml = this.markerEl.innerHTML;
        this.markerEl.innerHTML += childDiv;

        const iconEl = document.createElement('img');
        const iconName = InstructionIcon.find(
          instruction => instruction.instructionType === instructionType
        ).icon;
        iconEl.src = `assets/imgs/${iconName}`;
        iconEl.classList.add('icon');
        childDiv += `
          ${iconEl.outerHTML}
          </div>
        `;
        this.markerEl.innerHTML = (`${prevHtml} ${childDiv}`);
        if ((this.prevDistance <= 0.020) || (this.lineDistance <= 0.020)) {
          this.mergeInstructionsWithImage = true;
        }
      }
    }
    new mapboxgl.Marker(this.markerEl).setLngLat(coord).addTo(this.map);
  }

  setDestinationMarker(lon, lat) {
    this.map.addImage(
      'destination-point-circle',
      document.getElementById('destination-point-circle')
    );
    this.map.addImage(
      'destination-point',
      document.getElementById('destination-point')
    );
    this.map.addLayer({
      id: 'destination-circle',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [Number(lon), Number(lat)]
              }
            }
          ]
        }
      },
      layout: {
        'icon-image': 'destination-point-circle',
        'icon-size': this.isMobile ? 1 / 1.5 : 1,
        'icon-allow-overlap': true
      }
    });
    this.map.addLayer({
      id: 'destination-point',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [Number(lon), Number(lat)]
              }
            }
          ]
        }
      },
      layout: {
        'icon-image': 'destination-point',
        'icon-size': this.isMobile ? 1 / 1.5 : 1,
        'icon-offset': [3, 5],
        'icon-anchor': 'bottom'
      }
    });
  }

  getLayers() {
    return LayersConfig;
  }

  get activeLayer() {
    return this._activeLayer;
  }

  set activeLayer(layer) {
    this._activeLayer = layer;
  }

  getMap() {
    return this.map;
  }

  addLayer(clickedLayer: Layer) {
    this.map.addLayer({
      'id': clickedLayer.layerId,
      type: 'raster',
      'source': {
        type: 'image',
        url: clickedLayer.layerImage,
        coordinates: Config[this.venueId].mapCorners
      },
    });
  }

  displayLayer(clickedLayer: Layer) {
    this.map.setLayoutProperty(clickedLayer.layerId, 'visibility', 'visible');
  }

  hideLayers() {
    this.getLayers().forEach(layer => {
      if (this.map.getLayer(layer.layerId)) {
        this.map.setLayoutProperty(layer.layerId, 'visibility', 'none');
      }
    });
  }

  isLayerVisible(clickedLayer: Layer) {
    return this.map.getLayer(clickedLayer.layerId) && (this.map.getLayoutProperty(clickedLayer.layerId, 'visibility') === 'visible');
  }

  zoomToLinePoligon(coordinates, offset?, maxZoom?, padding?) {
    const bounds = coordinates.reduce((bnds, coord) => {
      return bnds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    this.fitBoundsRotated(bounds, {
      padding: padding || 60,
      offset: offset || [0, 0],
      bearing: Config[this.venueId].rotation,
      maxZoom: maxZoom || 18
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

    if (typeof options.padding === 'number') {
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
    // Now using a 'cropped rectangle' rotation method
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
      if (typeof console !== 'undefined') {
          console.log(
            'Map cannot fit within canvas with the given bounds, padding, and/or offset.'
          );
        }
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
