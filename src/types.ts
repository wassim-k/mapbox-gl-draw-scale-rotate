export type LngLat = { lng: number; lat: number };

export enum ScaleRotateCenter {
    Center = 0, // rotate or scale around center of polygon
    Opposite = 1, // rotate or scale around opposite side of polygon
}

export enum ScaleRotateOp {
    Scale = 1,
    Rotate = 2
}
