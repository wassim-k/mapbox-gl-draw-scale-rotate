# mapbox-gl-draw-scale-rotate

A custom mode for [MapboxGL-Draw](https://github.com/mapbox/mapbox-gl-draw) to rotate and scale features.

This fork of [ReyhaneMasumi / mapbox-gl-draw-scale-rotate-mode](https://github.com/ReyhaneMasumi/mapbox-gl-draw-scale-rotate-mode) has been ported to **typescript** and updated to target the **latest** mapbox version.

![A Gif showing demo usage](demo/public/demo.gif)

## Install

```bash
npm install mapbox-gl-draw-scale-rotate
```

## Usage

```js
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { ScaleRotateMode, ScaleRotateCenter, ScaleRotateStyle } from 'mapbox-gl-draw-scale-rotate';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-91.874, 42.76], // starting position
  zoom: 12, // starting zoom
});

const draw = new MapboxDraw({
  userProperties: true,
  displayControlsDefault: false,
  styles: ScaleRotateStyle,
  modes: Object.assign(MapboxDraw.modes, {
    scaleRotateMode: ScaleRotateMode,
  }),
});
map.addControl(draw);

// when mode drawing should be activated
draw.changeMode('scaleRotateMode', {
  canScale: true,
  canRotate: true, // only rotation enabled
  canTrash: false, // disable feature delete

  rotatePivot: ScaleRotateCenter.Center, // rotate around center
  scaleCenter: ScaleRotateCenter.Opposite, // scale around opposite vertex

  singleRotationPoint: true, // only one rotation point
  rotationPointRadius: 1.2, // offset rotation point

  canSelectFeatures: true
});
```

## [Example](https://github.com/wassim-k/mapbox-gl-draw-scale-rotate/blob/main/demo/src/App.tsx)
