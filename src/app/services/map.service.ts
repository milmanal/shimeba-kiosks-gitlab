import { Injectable } from '@angular/core';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import ImageLayer from 'ol/layer/Image.js';
import Static from 'ol/source/ImageStatic.js';
import {Style, Icon, Stroke} from 'ol/style';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';

import Projection from 'ol/proj/Projection.js';
import { fromLonLat, transformExtent} from 'ol/proj';

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

  constructor() { }

  initMap(mapImgUrl, minX, minY, maxX, maxY) {
    this.source = new OlXYZ({
      url: 'http://tile.osm.org/{z}/{x}/{y}.png'
    });

    this.layer = new OlTileLayer({
      source: this.source
    });

    this.vectorStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'assets/start.svg'
      }),
      stroke: new Stroke({
        width: 6,
        color: '#0277bd'
      })
    });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this.vectorStyle,
    });

    // minX, minY, maxX, maxY
    this.extent = transformExtent([minX, minY, maxX, maxY], 'EPSG:4326', 'EPSG:3857');

    this.projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: this.extent
    });

    this.staticSource = new Static({
      url: mapImgUrl,
      projection: this.projection,
      imageExtent: this.extent
    });

    this.imageLayer = new ImageLayer({
      source: this.staticSource
    });

    this.view = new OlView({
      center: fromLonLat([34.790005, 32.080043]),
      zoom: 19,
      rotation: 3 * Math.PI / 2 // -90
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.layer],
      view: this.view
    });
    this.map.addLayer(this.imageLayer);
    this.map.addLayer(this.vectorLayer);
    // this.map.getView().fit(this.extent, this.map.getSize()); // zoom extent
  }

  addMarker(lon, lat) {
    const marker = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
      population: 4000,
      rainfall: 500
    });
    this.vectorSource.addFeature(marker);
  }

  addRoute(route) {
    const polyline = new LineString(route).transform('EPSG:4326', 'EPSG:3857');
    const featurePolyline = new Feature(polyline);
    this.vectorSource.addFeature(featurePolyline);
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
