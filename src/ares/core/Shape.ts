import { Entity, EntityOptions } from "./Entity";

type CanvasStyleOptions = {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

// rect
type CanvasRectOptions = EntityOptions & {
  style?: CanvasStyleOptions;
};

class CanvasRect extends Entity {
  public style: CanvasStyleOptions;

  constructor(options: CanvasRectOptions = {}) {
    super(options);
    this.style = options.style || {};
  }
}

// circle
type CanvasCircleOptions = EntityOptions & {
  radius?: number;
  style?: CanvasStyleOptions;
};

class CanvasCircle extends Entity {
  public radius: number;
  public style: CanvasStyleOptions;

  constructor(options: CanvasCircleOptions = {}) {
    super(options);
    this.radius = options.radius || 50;
    this.style = options.style || {};

    this.anchor.set(this.radius, this.radius);
  }
}

export { CanvasRect, CanvasCircle };
