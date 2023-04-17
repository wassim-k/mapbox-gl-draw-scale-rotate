import { ScaleRotateCenter, LngLat } from './types';

export interface ScaleRotateModeOptions {
  featureId?: string;
  canTrash?: boolean;
  canScale?: boolean;
  canRotate?: boolean;
  singleRotationPoint?: boolean;
  rotationPointRadius?: number;
  rotatePivot?: ScaleRotateCenter;
  scaleCenter?: ScaleRotateCenter;
  canSelectFeatures?: boolean;
  startPos?: LngLat;
  coordPath?: string;
}
