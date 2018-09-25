import { Component, OnInit } from '@angular/core';

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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;
  imageLayer: ImageLayer;
  extent: any;
  projection: any;
  markerStyle: any;
  markerSource: any = new Vector();
  markerLayer: any;

  ngOnInit() {
    this.source = new OlXYZ({
      url: 'http://tile.osm.org/{z}/{x}/{y}.png'
    });

    this.layer = new OlTileLayer({
      source: this.source
    });

    // Marker
    this.markerStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: 'https://openlayers.org/en/v4.6.4/examples/data/icon.png'
      }),
      stroke: new Stroke({
        width: 6,
        color: '#0277bd'
      })
    });

    this.markerLayer = new VectorLayer({
      source: this.markerSource,
      style: this.markerStyle,
    });
    // ---

    // minX, minY, maxX, maxY
    this.extent = transformExtent([34.788334707804594, 32.07787512303872, 34.79172649237924, 32.08222892783535], 'EPSG:4326', 'EPSG:3857');

    this.projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: this.extent
    });

    this.imageLayer = new ImageLayer({
      source: new Static({
        url: 'https://i.imgur.com/xYT9Hpn.jpg',
        projection: this.projection,
        imageExtent: this.extent
      })
    });

    this.view = new OlView({
      center: fromLonLat([34.790005, 32.080043]),
      zoom: 18.5,
      rotation: 3 * Math.PI / 2 // -90
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.layer, this.imageLayer, this.markerLayer],
      view: this.view
    });

    // add marker for kiosk
    const iconFeature = new Feature({
      geometry: new Point(fromLonLat([34.7898267288336, 32.0804542067765])),
      population: 4000,
      rainfall: 500
    });
    this.markerSource.addFeature(iconFeature);
    // ----
    // 32.08046500220287 34.7902525216341
    const iconFeatureTest = new Feature({
      geometry: new Point(fromLonLat([34.7902525216341, 32.08046500220287])),
      population: 4000,
      rainfall: 500
    });
    this.markerSource.addFeature(iconFeatureTest);
    // ---
    // 32.08067777823903 34.78948105126619
    const iconFeatureTest2 = new Feature({
      geometry: new Point(fromLonLat([34.78948105126619, 32.08067777823903])),
      population: 4000,
      rainfall: 500
    });
    this.markerSource.addFeature(iconFeatureTest2);
    // ----


    // test
    const route = [
      [34.789826728833600, 32.080454206776500],
      [34.789826728833600, 32.080454206776500],
      [34.789796596480110, 32.080455572997340],
      [34.789695590830860, 32.080460152660110],
      [34.789693005730335, 32.080460269870270],
      [34.789635729875116, 32.080462866795250],
      [34.789551123737176, 32.080466702893090],
      [34.789495501586010, 32.080469224837880],
      [34.789463932498710, 32.080470656200940],
      [34.789458123495870, 32.080556956990840],
      [34.789452550118310, 32.080639757163810],
      [34.789447825923080, 32.080678323873620],
      [34.789481051266190, 32.080677778239030]
    ];
    const polyline = new LineString(route).transform('EPSG:4326', 'EPSG:3857');
    const featurePolyline = new Feature(polyline);
    this.markerSource.addFeature(featurePolyline);
    // ---
  }
}
