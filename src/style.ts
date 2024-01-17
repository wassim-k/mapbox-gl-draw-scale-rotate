import { lib } from '@mapbox/mapbox-gl-draw';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ScaleRotateStyle: Array<{ [key: string]: any }> = [
  ...lib.theme
    .map(style => {
      switch (style.id) {
        case 'gl-draw-polygon-fill-inactive': return { ...style, filter: [...style.filter, ['!=', 'user_type', 'overlay']] };
        case 'gl-draw-polygon-fill-active': return { ...style, filter: [...style.filter, ['!=', 'user_type', 'overlay']] };
        case 'gl-draw-polygon-stroke-inactive': return { ...style, filter: [...style.filter, ['!=', 'user_type', 'overlay']] };
        case 'gl-draw-polygon-fill-static': return { ...style, filter: [...style.filter, ['!=', 'user_type', 'overlay']] };
        case 'gl-draw-polygon-stroke-static': return { ...style, filter: [...style.filter, ['!=', 'user_type', 'overlay']] };
        case 'gl-draw-line-static': return { ...style, filter: [...style.filter, ['!=', 'user_type', 'overlay']] };
        case 'gl-draw-point-static': return { ...style, filter: [...style.filter, ['!=', 'user_type', 'overlay']] };
        case 'gl-draw-polygon-and-line-vertex-stroke-inactive': return { ...style, filter: [...style.filter, ['!has', 'scale']] };
        case 'gl-draw-polygon-and-line-vertex-inactive': return { ...style, filter: [...style.filter, ['!has', 'scale']] };
        case 'gl-draw-point-stroke-active': return { ...style, filter: [...style.filter, ['!has', 'scale']] };
        case 'gl-draw-point-active': return { ...style, filter: [...style.filter, ['!has', 'scale']] };
        default: return style;
      }
    }),
  {
    id: 'gl-draw-overlay-polygon-fill-inactive',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['==', 'user_type', 'overlay'],
      ['!=', 'mode', 'static']
    ],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.01
    }
  },
  {
    id: 'gl-draw-overlay-polygon-fill-active',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'true'],
      ['==', '$type', 'Polygon'],
      ['==', 'user_type', 'overlay']
    ],
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.01
    }
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-scale-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static'],
      ['has', 'heading']
    ],
    layout: {
      'icon-image': 'scale',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      'icon-rotate': ['get', 'heading']
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0
      }
    }
  },
  {
    id: 'gl-draw-line-rotate-point',
    type: 'line',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static']
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-polygon-rotate-point-stroke',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff'
    }
  },
  {
    id: 'gl-draw-polygon-rotate-point',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    paint: {
      'circle-radius': 2,
      'circle-color': '#fbb03b'
    }
  },
  {
    id: 'gl-draw-polygon-rotate-point-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    layout: {
      'icon-image': 'rotate',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      'icon-rotate': ['get', 'heading']
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0
      }
    }
  }
];
