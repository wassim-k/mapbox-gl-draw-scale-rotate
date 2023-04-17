import { DrawFeature } from '@mapbox/mapbox-gl-draw';
import { Position } from '@turf/helpers';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { ScaleRotateCenter, LngLat, TxMode } from './types';

export interface ScaleRotateModeState {
  canRotate: boolean;
  canScale: boolean;
  selectedCoordPaths: Array<string>;
  canTrash: boolean;
  featureId?: string;
  feature: DrawFeature;
  singleRotationPoint?: boolean;
  rotationPointRadius: number;
  rotatePivot: ScaleRotateCenter;
  scaleCenter: ScaleRotateCenter;
  canSelectFeatures?: boolean;
  dragMoveLocation?: LngLat;
  dragMoving?: boolean;
  canDragMove?: boolean;
  txMode?: TxMode;
  rotation?: {
    feature: Feature;
    centers: Array<Position>;
    headings: Array<number>;
  };
  scaling?: {
    feature: Feature<Geometry, GeoJsonProperties>;
    centers: Array<Position>;
    distances: Array<number>;
  };
}
