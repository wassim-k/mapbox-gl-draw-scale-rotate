/* eslint-disable */

import '@mapbox/mapbox-gl-draw';

declare module '@mapbox/mapbox-gl-draw' {

  export const lib: {
    theme: Array<any>;
    doubleClickZoom: {
      disable(ctx: any): any;
      enable(ctx: any): any;
    };
    moveFeatures(...args: Array<any>): any;
    createSupplementaryPoints(geojson: GeoJSON.Feature, options: any, basePath?: string | null): Array<GeoJSON.Feature<GeoJSON.Point>>;
    CommonSelectors: {
      isOfMetaType(type: any): (e: any) => boolean;
      isShiftMousedown(e: any): boolean;
      isActiveFeature(e: any): boolean;
      isInactiveFeature(e: any): boolean;
      noTarget(e: any): boolean;
      isFeature(e: any): boolean;
      isVertex(e: any): boolean;
      isShiftDown(e: any): boolean;
      isEscapeKey(e: any): boolean;
      isEnterKey(e: any): boolean;
      isTrue(): boolean;
    };
  }

  export const constants: {
    classes: Classes,
    sources: Sources,
    cursors: Cursors,
    types: Types,
    geojsonTypes: GeojsonTypes,
    events: Events,
    updateActions: UpdateActions,
    meta: Meta,
    activeStates: ActiveStates,
    modes: {
      DRAW_LINE_STRING: 'draw_line_string',
      DRAW_POLYGON: 'draw_polygon',
      DRAW_POINT: 'draw_point',
      SIMPLE_SELECT: 'simple_select',
      DIRECT_SELECT: 'direct_select',
      STATIC: 'static'
    };
    interactions: [
      'scrollZoom',
      'boxZoom',
      'dragRotate',
      'dragPan',
      'keyboard',
      'doubleClickZoom',
      'touchZoomRotate'
    ],
    LAT_MIN: -90,
    LAT_RENDERED_MIN: -85,
    LAT_MAX: 90,
    LAT_RENDERED_MAX: 85,
    LNG_MIN: -270,
    LNG_MAX: 270
  };

  interface Classes {
    CONTROL_BASE: string;
    CONTROL_PREFIX: string;
    CONTROL_BUTTON: string;
    CONTROL_BUTTON_LINE: string;
    CONTROL_BUTTON_POLYGON: string;
    CONTROL_BUTTON_POINT: string;
    CONTROL_BUTTON_TRASH: string;
    CONTROL_BUTTON_COMBINE_FEATURES: string;
    CONTROL_BUTTON_UNCOMBINE_FEATURES: string;
    CONTROL_GROUP: string;
    ATTRIBUTION: string;
    ACTIVE_BUTTON: string;
    BOX_SELECT: string;
  }

  interface Sources {
    HOT: string;
    COLD: string;
  }

  interface Cursors {
    ADD: string;
    MOVE: string;
    DRAG: string;
    POINTER: string;
    NONE: string;
  }

  interface Types {
    POLYGON: string;
    LINE: string;
    POINT: string;
  }

  interface GeojsonTypes {
    FEATURE: 'Feature',
    POLYGON: 'Polygon',
    LINE_STRING: 'LineString',
    POINT: 'Point',
    FEATURE_COLLECTION: 'FeatureCollection',
    MULTI_PREFIX: 'Multi',
    MULTI_POINT: 'MultiPoint',
    MULTI_LINE_STRING: 'MultiLineString',
    MULTI_POLYGON: 'MultiPolygon'
  }

  interface Events {
    CREATE: string;
    DELETE: string;
    UPDATE: string;
    SELECTION_CHANGE: string;
    MODE_CHANGE: string;
    ACTIONABLE: string;
    RENDER: string;
    COMBINE_FEATURES: string;
    UNCOMBINE_FEATURES: string;
  }

  interface UpdateActions {
    MOVE: string;
    CHANGE_COORDINATES: string;
  }

  interface Meta {
    FEATURE: string;
    MIDPOINT: string;
    VERTEX: string;
  }

  interface ActiveStates {
    ACTIVE: string;
    INACTIVE: string;
  }
}
