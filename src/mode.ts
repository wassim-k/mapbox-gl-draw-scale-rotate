import type { DrawCustomMode, DrawCustomModeThis, MapMouseEvent, MapTouchEvent } from '@mapbox/mapbox-gl-draw';
import MapboxGLDraw from '@mapbox/mapbox-gl-draw';
import bearing from '@turf/bearing';
import center from '@turf/center';
import destination from '@turf/destination';
import distance from '@turf/distance';
import { AllGeoJSON, Coord, point } from '@turf/helpers';
import midpoint from '@turf/midpoint';
import transformRotate from '@turf/transform-rotate';
import transformScale from '@turf/transform-scale';
import { Feature, Position } from 'geojson';
import { ScaleRotateModeOptions } from './options';
import { ScaleRotateModeState } from './state';
import { LngLat, ScaleRotateCenter, ScaleRotateOp } from './types';
import { flatten } from './utils';

export const scaleRotateModeName = 'scale_rotate';

const { doubleClickZoom, CommonSelectors, moveFeatures, createSupplementaryPoints } = MapboxGLDraw.lib;

export interface ScaleRotateMode extends DrawCustomMode<ScaleRotateModeState, ScaleRotateModeOptions> {
  pathsToCoordinates(featureId: string, paths: Array<string>): Array<{ coord_path: string; feature_id: string }>;
  computeBisectrix(points: Array<GeoJSON.Feature<GeoJSON.Point>>): void;
  startDragging(state: ScaleRotateModeState, e: MapMouseEvent): void;
  stopDragging(state: ScaleRotateModeState): void;
  onMouseDownOrTouchStart(state: ScaleRotateModeState, e: MapMouseEvent | MapTouchEvent): void;
  onMouseUpOrTouchEnd(state: ScaleRotateModeState, e: MapMouseEvent | MapTouchEvent): void;
  onVertex(state: ScaleRotateModeState, e: MapMouseEvent | MapTouchEvent): void;
  onRotatePoint(state: ScaleRotateModeState, e: MapMouseEvent | MapTouchEvent): void;
  onFeature(state: ScaleRotateModeState, e: MapMouseEvent | MapTouchEvent): void;
  coordinateIndex(coordPaths: Array<string>): number;
  computeRotationCenter(state: ScaleRotateModeState, polygon: GeoJSON.Feature): GeoJSON.Feature<GeoJSON.Point>;
  computeAxes(state: ScaleRotateModeState, geojson: GeoJSON.Feature): void;
  dragRotatePoint(state: ScaleRotateModeState, e: MapMouseEvent, delta: LngLat): void;
  dragScalePoint(state: ScaleRotateModeState, e: MapMouseEvent, delta: LngLat): void;
  dragFeature(state: ScaleRotateModeState, e: MapMouseEvent, delta: LngLat): void;
  fireUpdate(): void;
  clickActiveFeature(state: ScaleRotateModeState): void;
  clickNoTarget(state: ScaleRotateModeState, e: MapMouseEvent): void;
  clickInactive(state: ScaleRotateModeState, e: MapMouseEvent): void;
  createRotationPoints(state: ScaleRotateModeState, geojson: GeoJSON.Feature, suppPoints: Array<GeoJSON.Feature<GeoJSON.Point>>): Array<GeoJSON.Feature> | undefined;
  createRotationPoint(featureId: string, v1: Coord, v2: Coord, rotCenter: Coord, radiusScale: number): GeoJSON.Feature;
}

type ScaleRotateModeThis = ScaleRotateMode & DrawCustomModeThis;

const isRotatePoint = CommonSelectors.isOfMetaType(MapboxGLDraw.constants.meta.MIDPOINT);
const isVertex = CommonSelectors.isOfMetaType(MapboxGLDraw.constants.meta.VERTEX);

export const ScaleRotateMode: ScaleRotateMode = {
  onSetup(this: ScaleRotateModeThis, options: ScaleRotateModeOptions) {
    const featureId = options.featureId || this.getSelected()[0]?.id?.toString();

    const feature = this.getFeature(featureId);

    if (!feature) {
      throw new Error('You must provide a valid featureId to enter ScaleRotateMode');
    }

    if (
      feature.type === MapboxGLDraw.constants.geojsonTypes.POINT
      || feature.type === MapboxGLDraw.constants.geojsonTypes.MULTI_POINT
    ) {
      throw new TypeError('ScaleRotateMode can not handle points');
    }

    const state: ScaleRotateModeState = {
      featureId,
      feature,
      canTrash: options.canTrash ?? true,
      canScale: options.canScale ?? true,
      canRotate: options.canRotate ?? true,
      singleRotationPoint: options.singleRotationPoint ?? false,
      rotationPointRadius: options.rotationPointRadius ?? 1.0,
      rotatePivot: options.rotatePivot ?? ScaleRotateCenter.Center,
      scaleCenter: options.scaleCenter ?? ScaleRotateCenter.Center,
      canSelectFeatures: options.canSelectFeatures ?? true,
      dragMoveLocation: options.startPos,
      dragMoving: false,
      canDragMove: false,
      selectedCoordPaths: options.coordPath ? [options.coordPath] : [],
    };

    if (!(state.canRotate || state.canScale)) {
      console.warn('Non of canScale or canRotate is true');
    }

    this.setSelectedCoordinates(
      this.pathsToCoordinates(featureId, state.selectedCoordPaths),
    );
    this.setSelected(featureId);
    doubleClickZoom.disable(this);

    this.setActionableState({
      combineFeatures: false,
      uncombineFeatures: false,
      trash: state.canTrash,
    });

    return state;
  },
  toDisplayFeatures(this: ScaleRotateModeThis, state, geojson: Feature, display) {
    if (state.featureId === geojson.properties?.id) {
      (geojson.properties ??= {}).active = MapboxGLDraw.constants.activeStates.ACTIVE;
      display(geojson);

      const suppPoints = createSupplementaryPoints(geojson, {
        midpoints: false,
        selectedPaths: state.selectedCoordPaths,
      });

      if (state.canScale) {
        this.computeBisectrix(suppPoints);
        suppPoints.forEach(display);
      }

      if (state.canRotate) {
        const rotPoints = this.createRotationPoints(state, geojson, suppPoints);
        rotPoints?.forEach(display);
      }
    }
    else {
      (geojson.properties ??= {}).active = MapboxGLDraw.constants.activeStates.INACTIVE;
      display(geojson);
    }

    this.setActionableState({
      combineFeatures: false,
      uncombineFeatures: false,
      trash: state.canTrash,
    });
  },
  onStop(this: ScaleRotateModeThis) {
    doubleClickZoom.enable(this);
    this.clearSelectedCoordinates();
  },
  pathsToCoordinates(this: ScaleRotateModeThis, featureId: string, paths: Array<string>) {
    return paths.map((coord_path) => {
      return { feature_id: featureId, coord_path };
    });
  },
  computeBisectrix(this: ScaleRotateModeThis, points: Array<GeoJSON.Feature<GeoJSON.Point>>) {
    for (let i1 = 0; i1 < points.length; i1++) {
      const i0 = (i1 - 1 + points.length) % points.length;
      const i2 = (i1 + 1) % points.length;

      const a1 = bearing(
        points[i0].geometry.coordinates,
        points[i1].geometry.coordinates,
      );

      const a2 = bearing(
        points[i2].geometry.coordinates,
        points[i1].geometry.coordinates,
      );

      let a = (a1 + a2) / 2.0;

      if (a < 0.0) a += 360;
      if (a > 360) a -= 360;

      const properties = points[i1].properties ??= {};
      properties.heading = a;
      properties.scale = true;
    }
  },
  createRotationPoints(this: ScaleRotateModeThis, state, geojson: GeoJSON.Feature, suppPoints: Array<GeoJSON.Feature<GeoJSON.Point>>) {
    const { type } = geojson.geometry;
    const featureId = geojson.properties && geojson.properties.id;

    const rotationWidgets: Array<GeoJSON.Feature> = [];
    if (
      type === MapboxGLDraw.constants.geojsonTypes.POINT
      || type === MapboxGLDraw.constants.geojsonTypes.MULTI_POINT
    ) {
      return;
    }

    const corners = suppPoints.slice(0);
    corners[corners.length] = corners[0];

    let v1: Coord | null = null;

    const rotCenter = this.computeRotationCenter(state, geojson);

    if (state.singleRotationPoint) {
      rotationWidgets.push(this.createRotationPoint(
        featureId,
        corners[0],
        corners[1],
        rotCenter,
        state.rotationPointRadius,
      ));
    }
    else {
      corners.forEach((v2: Feature<GeoJSON.Point>) => {
        if (v1 != null) {
          rotationWidgets.push(this.createRotationPoint(
            featureId,
            v1,
            v2,
            rotCenter,
            state.rotationPointRadius,
          ));
        }

        v1 = v2;
      });
    }

    return rotationWidgets;
  },
  createRotationPoint(this: ScaleRotateModeThis, featureId: string, v1: Coord, v2: Coord, rotCenter: Coord, radiusScale: number) {
    const cR0 = midpoint(v1, v2).geometry.coordinates;
    const heading = bearing(rotCenter, cR0);
    const distance0 = distance(rotCenter, cR0);
    const distance1 = radiusScale * distance0; // TODO depends on map scale
    const cR1 = destination(rotCenter, distance1, heading, {}).geometry.coordinates;

    return {
      type: 'Feature',
      properties: {
        meta: MapboxGLDraw.constants.meta.MIDPOINT,
        icon: 'rotate',
        parent: featureId,
        lng: cR1[0],
        lat: cR1[1],
        coord_path: 'properties' in v1 ? v1.properties?.coord_path : undefined,
        heading: heading,
      },
      geometry: {
        type: 'Point',
        coordinates: cR1,
      },
    };
  },
  startDragging(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    this.map.dragPan.disable();
    state.canDragMove = true;
    state.dragMoveLocation = e.lngLat;
  },
  stopDragging(this: ScaleRotateModeThis, state) {
    this.map.dragPan.enable();
    state.dragMoving = false;
    state.canDragMove = false;
    state.dragMoveLocation = undefined;
  },
  onTouchStart(this: ScaleRotateModeThis, state, e: MapTouchEvent) {
    this.onMouseDownOrTouchStart(state, e);
  },
  onMouseDown(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    this.onMouseDownOrTouchStart(state, e);
  },
  onMouseDownOrTouchStart(this: ScaleRotateModeThis, state, e: MapMouseEvent | MapTouchEvent) {
    if (isVertex(e)) return this.onVertex(state, e);
    if (isRotatePoint(e)) return this.onRotatePoint(state, e);
    if (CommonSelectors.isActiveFeature(e)) return this.onFeature(state, e);
  },
  onTouchEnd(this: ScaleRotateModeThis, state, e) {
    this.onMouseUpOrTouchEnd(state, e);
  },
  onMouseUp(this: ScaleRotateModeThis, state, e) {
    this.onMouseUpOrTouchEnd(state, e);
  },
  onMouseUpOrTouchEnd(this: ScaleRotateModeThis, state, _e) {
    if (state.dragMoving) {
      this.fireUpdate();
    }
    this.stopDragging(state);
  },
  onVertex(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    // convert internal MapboxDraw feature to valid GeoJSON:
    this.computeAxes(state, state.feature.toGeoJSON() as Feature);

    this.startDragging(state, e);

    const { properties } = e.featureTarget;
    if (properties !== null) {
      state.selectedCoordPaths = [properties.coord_path];
      state.currentOp = ScaleRotateOp.Scale;
    }
  },
  onRotatePoint(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    // convert internal MapboxDraw feature to valid GeoJSON:
    this.computeAxes(state, state.feature.toGeoJSON() as Feature);

    this.startDragging(state, e);

    const { properties } = e.featureTarget;
    if (properties !== null) {
      state.selectedCoordPaths = [properties.coord_path];
      state.currentOp = ScaleRotateOp.Rotate;
    }
  },
  onFeature(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    state.selectedCoordPaths = [];
    this.startDragging(state, e);
  },
  coordinateIndex(this: ScaleRotateModeThis, coordPaths: Array<string>) {
    if (coordPaths.length >= 1) {
      const parts = coordPaths[0].split('.');
      return parseInt(parts[parts.length - 1]);
    }
    else {
      return 0;
    }
  },
  computeRotationCenter(this: ScaleRotateModeThis, _state, polygon: GeoJSON.Feature) {
    return center(polygon as AllGeoJSON);
  },
  computeAxes(this: ScaleRotateModeThis, state, geojson: GeoJSON.Feature) {
    // TODO check min 3 points
    const center0 = this.computeRotationCenter(state, geojson);
    let corners: Array<Position>;
    switch (geojson.geometry.type) {
      case MapboxGLDraw.constants.geojsonTypes.POLYGON:
        corners = (geojson.geometry as any).coordinates[0].slice(0);
        break;
      case MapboxGLDraw.constants.geojsonTypes.MULTI_POLYGON:
        corners = flatten(flatten((geojson.geometry as any).coordinates));
        break;
      case MapboxGLDraw.constants.geojsonTypes.LINE_STRING:
        corners = (geojson.geometry as any).coordinates;
        break;
      case MapboxGLDraw.constants.geojsonTypes.MULTI_LINE_STRING:
        corners = flatten((geojson.geometry as any).coordinates);
        break;
      default: corners = [];
    }

    const n = corners.length - 1;
    const iHalf = Math.floor(n / 2);

    const rotateCenters = [];
    const headings = [];

    for (let i1 = 0; i1 < n; i1++) {
      let i0 = i1 - 1;
      if (i0 < 0) i0 += n;

      const c0 = corners[i0];
      const c1 = corners[i1];
      const rotPoint = midpoint(point(c0), point(c1));

      let rotCenter = center0;
      if (ScaleRotateCenter.Opposite === state.rotatePivot) {
        const i3 = (i1 + iHalf) % n; // opposite corner
        let i2 = i3 - 1;
        if (i2 < 0) i2 += n;

        const c2 = corners[i2];
        const c3 = corners[i3];
        rotCenter = midpoint(point(c2), point(c3));
      }

      rotateCenters[i1] = rotCenter.geometry.coordinates;
      headings[i1] = bearing(rotCenter, rotPoint);
    }

    state.rotation = {
      feature: geojson, // initial feature state
      centers: rotateCenters,
      headings: headings, // rotation start heading for each point
    };

    // compute current distances from centers for scaling

    const scaleCenters = [];
    const distances = [];
    for (let i = 0; i < n; i++) {
      const c1 = corners[i];
      let c0 = center0.geometry.coordinates;
      if (ScaleRotateCenter.Opposite === state.scaleCenter) {
        const i2 = (i + iHalf) % n; // opposite corner
        c0 = corners[i2];
      }
      scaleCenters[i] = c0;
      distances[i] = distance(point(c0), point(c1), { units: 'meters' });
    }

    state.scaling = {
      feature: geojson, // initial feature state
      centers: scaleCenters,
      distances: distances,
    };
  },
  onDrag(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    if (state.canDragMove !== true) return;
    state.dragMoving = true;
    e.originalEvent.stopPropagation();

    const delta: LngLat = {
      lng: e.lngLat.lng - (state.dragMoveLocation?.lng ?? 0),
      lat: e.lngLat.lat - (state.dragMoveLocation?.lat ?? 0),
    };
    if (state.selectedCoordPaths.length > 0 && state.currentOp) {
      switch (state.currentOp) {
        case ScaleRotateOp.Rotate:
          this.dragRotatePoint(state, e, delta);
          break;
        case ScaleRotateOp.Scale:
          this.dragScalePoint(state, e, delta);
          break;
      }
    }
    else {
      this.dragFeature(state, e, delta);
    }

    state.dragMoveLocation = e.lngLat;
  },
  dragRotatePoint(this: ScaleRotateModeThis, state, e: MapMouseEvent, _delta: LngLat) {
    if (state.rotation === undefined) {
      throw new Error('state.rotation required');
    }

    const m1 = point([e.lngLat.lng, e.lngLat.lat]);

    const n = state.rotation.centers.length;
    const cIdx = (this.coordinateIndex(state.selectedCoordPaths) + 1) % n;
    // TODO validate cIdx
    const cCenter = state.rotation.centers[cIdx];
    const center = point(cCenter);

    const heading1 = bearing(center, m1);

    const heading0 = state.rotation.headings[cIdx];
    let rotateAngle = heading1 - heading0; // in degrees

    if (CommonSelectors.isShiftDown(e)) {
      rotateAngle = 5.0 * Math.round(rotateAngle / 5.0);
    }

    const rotatedFeature = transformRotate(state.rotation.feature as AllGeoJSON, rotateAngle, {
      pivot: center,
      mutate: false,
    }) as Feature;

    if ('coordinates' in rotatedFeature.geometry) {
      const coordinates = rotatedFeature.geometry.coordinates as Position & Array<Position> & Array<Array<Position>> & Array<Array<Array<Position>>>;
      state.feature.incomingCoords(coordinates);
    }

    this.fireUpdate();
  },
  dragScalePoint(this: ScaleRotateModeThis, state, e: MapMouseEvent, _delta: LngLat) {
    if (state.scaling === undefined) {
      throw new Error('state.scaling required');
    }

    const cIdx = this.coordinateIndex(state.selectedCoordPaths);
    // TODO validate cIdx

    const cCenter = state.scaling.centers[cIdx];
    const center = point(cCenter);
    const m1 = point([e.lngLat.lng, e.lngLat.lat]);

    const dist = distance(center, m1, { units: 'meters' });
    let scale = dist / state.scaling.distances[cIdx];

    if (CommonSelectors.isShiftDown(e)) {
      // TODO discrete scaling
      scale = 0.05 * Math.round(scale / 0.05);
    }

    const scaledFeature = transformScale(state.scaling.feature as AllGeoJSON, scale, {
      origin: cCenter,
      mutate: false,
    }) as Feature;

    if ('coordinates' in scaledFeature.geometry) {
      const coordinates = scaledFeature.geometry.coordinates as Position & Array<Position> & Array<Array<Position>> & Array<Array<Array<Position>>>;
      state.feature.incomingCoords(coordinates);
    }

    this.fireUpdate();
  },
  dragFeature(this: ScaleRotateModeThis, state, e: MapMouseEvent, delta: LngLat) {
    moveFeatures(this.getSelected(), delta);
    state.dragMoveLocation = e.lngLat;

    this.fireUpdate();
  },
  fireUpdate(this: ScaleRotateModeThis) {
    this.map.fire(MapboxGLDraw.constants.events.UPDATE, {
      action: MapboxGLDraw.constants.updateActions.CHANGE_COORDINATES,
      features: this.getSelected().map(feature => feature.toGeoJSON()),
    });
  },
  onMouseOut(this: ScaleRotateModeThis, state) {
    // As soon as you mouse leaves the canvas, update the feature
    if (state.dragMoving) {
      this.fireUpdate();
    }
  },
  clickActiveFeature(this: ScaleRotateModeThis, state) {
    state.selectedCoordPaths = [];
    this.clearSelectedCoordinates();
    state.feature.changed();
  },
  onClick(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    if (CommonSelectors.noTarget(e)) return this.clickNoTarget(state, e);
    if (CommonSelectors.isActiveFeature(e))
      return this.clickActiveFeature(state);
    if (CommonSelectors.isInactiveFeature(e)) return this.clickInactive(state, e);
    this.stopDragging(state);
  },
  clickNoTarget(this: ScaleRotateModeThis, state, _e: MapMouseEvent) {
    if (state.canSelectFeatures) this.changeMode(MapboxGLDraw.constants.modes.SIMPLE_SELECT);
  },
  clickInactive(this: ScaleRotateModeThis, state, e: MapMouseEvent) {
    if (state.canSelectFeatures && e.featureTarget.properties?.id) {
      this.changeMode(MapboxGLDraw.constants.modes.SIMPLE_SELECT, {
        featureIds: [e.featureTarget.properties.id],
      });
    }
  },
  onTrash(this: ScaleRotateModeThis) {
    this.deleteFeature(this.getSelectedIds()[0]);
  },
};
