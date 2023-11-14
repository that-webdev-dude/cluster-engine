import Entity from "./Entity";
import Vector from "../tools/Vector";

interface CanvasStyleOptions {
  fill: string;
  stroke: string;
  lineWidth: number;
}

interface CanvasRectOptions {
  position?: Vector;
  height?: number;
  width?: number;
  style?: CanvasStyleOptions;
}

class CanvasRect extends Entity {
  public style: CanvasStyleOptions;

  constructor({
    position = new Vector(),
    height = 0,
    width = 0,
    style = { fill: "red", stroke: "red", lineWidth: 0 },
  }: CanvasRectOptions = {}) {
    super({
      position,
      height,
      width,
    });
    this.style = style;
  }
}

interface CanvasRectOptions {
  position?: Vector;
  radius?: number;
  style?: CanvasStyleOptions;
}

class CanvasCircle extends Entity {
  public radius: number;
  public style: CanvasStyleOptions;

  constructor({
    position = new Vector(),
    radius = 0,
    style = { fill: "red", stroke: "red", lineWidth: 0 },
  }: CanvasRectOptions = {}) {
    super({
      position,
      height: radius * 2,
      width: radius * 2,
    });
    this.radius = radius;
    this.style = style;
  }
}

export { CanvasRect, CanvasCircle };
