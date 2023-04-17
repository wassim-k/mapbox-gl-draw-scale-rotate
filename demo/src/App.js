import React, { useRef, useEffect } from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { ScaleRotateMode, ScaleRotateCenter, ScaleRotateStyle } from 'mapbox-gl-draw-scale-rotate';
import rotateImg from 'mapbox-gl-draw-scale-rotate/dist/img/rotate.png';
import scaleImg from 'mapbox-gl-draw-scale-rotate/dist/img/scale.png';
import './App.css';
import { ExtendDrawBar } from './extendDrawBar';

let map;
let draw;
let drawBar;

function App() {
  let mapRef = useRef(null);

  useEffect(() => {
    map = new mapboxGl.Map({
      container: mapRef.current || '',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [51.3857, 35.6102],
      zoom: 10,
      pitch: 0,
      accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
    });

    map.loadImage(rotateImg, function (error, image) {
      if (error) throw error;
      map.addImage('rotate', image);
    });
    map.loadImage(scaleImg, function (error, image) {
      if (error) throw error;
      map.addImage('scale', image);
    });

    draw = new MapboxDraw({
      modes: {
        ...MapboxDraw.modes,
        scaleRotateMode: ScaleRotateMode
      },
      styles: ScaleRotateStyle,
      userProperties: true,
    });

    drawBar = new ExtendDrawBar({
      draw: draw,
      buttons: [
        {
          on: 'click',
          action: scaleRotate,
          classes: ['rotate-icon'],
        },
      ],
    });

    map.once('load', () => {
      map.resize();
      map.addControl(drawBar, 'top-right');
      draw.set({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            id: 'example-id',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [51.41742415918904, 35.73019558439101],
                  [51.31319413385742, 35.702773908694724],
                  [51.378997493472525, 35.665562843119986],
                  [51.45008537540798, 35.67776544979942],
                  [51.46619566741822, 35.70822028156377],
                  [51.41742415918904, 35.73019558439101],
                ],
              ],
            },
          },
          {
            id: 'example2_id',
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [51.46717071533203, 35.752642192392955],
                [51.41704559326172, 35.7715862712587],
                [51.37207031249999, 35.73954585450408],
                [51.31988525390625, 35.753756674845675],
                [51.29344940185547, 35.713904233681035],
                [51.37035369873047, 35.67012719291238],
                [51.32434844970703, 35.633581468816594],
              ],
            },
          },
        ],
      });
    });
  }, []);

  const scaleRotate = () => {
    try {
      draw.changeMode('scaleRotateMode', {
        // required
        canScale: true,
        canRotate: true, // only rotation enabled
        canTrash: false, // disable feature delete

        rotatePivot: ScaleRotateCenter.Center, // rotate around center
        scaleCenter: ScaleRotateCenter.Opposite, // scale around opposite vertex

        singleRotationPoint: true, // only one rotation point
        rotationPointRadius: 1.2, // offset rotation point

        canSelectFeatures: true,
      });
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div className="map-wrapper">
      <div id="map" ref={mapRef} />
    </div>
  );
}

export default App;
