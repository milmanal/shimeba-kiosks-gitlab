import { Injectable } from '@angular/core';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import ImageLayer from 'ol/layer/Image.js';
import Static from 'ol/source/ImageStatic.js';
import {Style, Icon, Stroke, Text, Fill, Circle} from 'ol/style';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Overlay } from 'ol';

import Projection from 'ol/proj/Projection.js';
import { fromLonLat, transformExtent} from 'ol/proj';

import {Config} from './../configs/config';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;
  imageLayer: ImageLayer;
  extent: any;
  projection: any;
  vectorStyle: any;
  vectorSource: any = new Vector();
  vectorLayer: any;
  staticSource: any;
  styles: any;
  interval: any;

  constructor() { }

  initMap() {
    this.source = new OlXYZ({
      url: 'http://tile.osm.org/{z}/{x}/{y}.png'
    });

    this.layer = new OlTileLayer({
      source: this.source
    });

    this.styles = {
      'route': new Style({
        stroke: new Stroke({
          width: 10,
          color: '#0277bd'
        })
      }),
      'start': new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/imgs/start.svg'
        })
      }),
      'destination': new Style({
        image: new Icon({
          anchor: [0.45, 0.9],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/imgs/route-dest.svg'
        })
      }),
      'destinationPoint': new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/imgs/point.svg'
        })
      }),
      'backgroundNumber': new Style({
        image: new Circle({
          radius: 25,
          fill: new Fill({
            color: '#4a90e2',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 1
          })
        })
      })
    };

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: (feature) => this.styles[feature.get('type')]
    });

    // minX, minY, maxX, maxY
    this.extent = transformExtent([
      Config.imageExtent.minX,
      Config.imageExtent.minY,
      Config.imageExtent.maxX,
      Config.imageExtent.maxY
    ], 'EPSG:4326', 'EPSG:3857');

    this.projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: this.extent
    });

    this.staticSource = new Static({
      url: Config.initMapUrl,
      projection: this.projection,
      imageExtent: this.extent,
    });

    this.imageLayer = new ImageLayer({
      source: this.staticSource,
    });

    this.view = new OlView({
      center: fromLonLat([34.790005, 32.080043]),
      zoom: 19,
      rotation: -92.9 * Math.PI / 180
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.layer],
      view: this.view
    });
    this.map.addLayer(this.imageLayer);
    this.map.addLayer(this.vectorLayer);
    // this.map.getView().fit(this.extent); // zoom extent
  }

  addMarker(lon, lat, type) {
    const lonLatToNumber = [
      Number(lon),
      Number(lat)
    ];
    const marker = new Feature({
      geometry: new Point(fromLonLat(lonLatToNumber)),
      population: 4000,
      rainfall: 500,
      type: type
    });
    this.vectorSource.addFeature(marker);
  }

  setDestinationMarker(lon, lat) {
    const lonLatToNumber = [
      Number(lon),
      Number(lat)
    ];
    const point = new Feature({
      geometry: new Point(fromLonLat(lonLatToNumber)),
      population: 4000,
      rainfall: 500,
      type: 'destinationPoint'
    });
    this.vectorSource.addFeature(point);
    const marker = new Feature({
      geometry: new Point(fromLonLat(lonLatToNumber)),
      population: 4000,
      rainfall: 500,
      type: 'destination'
    });
    this.vectorSource.addFeature(marker);
  }

  addInstructionNumber(number, coord) {
    this.styles[number] = new Style({
      text: new Text({
        font: '40px Almoni',
        fill: new Fill({ color: '#fff' }),
        stroke: new Stroke({
          color: '#fff', width: 2
        }),
        text: String(number)
      })
    });
    const textMsg = new Feature({
      geometry: new Point(fromLonLat(coord)),
      type: String(number)
    });
    const background = new Feature({
      geometry: new Point(fromLonLat(coord)),
      type: 'backgroundNumber'
    });
    this.vectorSource.addFeature(background);
    this.vectorSource.addFeature(textMsg);
  }

  addRoute(direction) {
    if(direction.length) {
      const directionDistance = direction[direction.length - 1][1].distanceCovered - direction[0][0].distanceCovered;
      this.setDirection(direction, 0, 1500, this.vectorSource, directionDistance, this.setDirection);
    }
  }

  setDirection(direction, index, time, vectorSource, distance, fn) {
    const startPt = fromLonLat(direction[index][0].point);
    const endPt = fromLonLat(direction[index][1].point);
    const steps = direction[index][1].distanceCovered - direction[index][0].distanceCovered || 1;
    const directionX = (endPt[0] - startPt[0]) / steps;
    const directionY = (endPt[1] - startPt[1]) / steps;
    let i = 0;

    const timeForCurrentStep = time/(distance/steps)/steps;

    const interval = setInterval(() => {
      if (i > steps) {
          clearInterval(interval);
          if (fn && (direction.length - 1) > index + 1) {
            fn(direction, index+1, time, vectorSource, distance, fn)
          } else if(fn && direction[index + 1]) {
            fn(direction, index+1, time, vectorSource, distance, null)
          };
          return;
      }
      const polyline = new LineString(
        [
          startPt,
          [startPt[0] + i * directionX, startPt[1] + i * directionY]
        ]
      );
      const featurePolyline = new Feature({
        geometry: polyline,
        type: 'route'
      });
      vectorSource.addFeature(featurePolyline);
      i++;
    }, timeForCurrentStep)
  }
  

  changeMapLayer(url) {
    this.map.removeLayer(this.imageLayer);
    this.staticSource = new Static({
      url: url,
      projection: this.projection,
      imageExtent: this.extent
    });
    this.imageLayer = new ImageLayer({
      source: this.staticSource
    });
    this.map.getLayers().insertAt(1, this.imageLayer);
  }
}
