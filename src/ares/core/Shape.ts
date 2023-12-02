import Vector from "../tools/Vector";
import { IEntity, IEntityConfig, IENTITY_DEFAULTS } from "../types";

// TODO: Shape can just extend the entity class

interface IShape extends IEntity {
  fill: string;
  stroke: string;
  lineWidth: number;
}

interface ShapeConfig extends IEntityConfig {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

const SHAPE_DEFAULTS = {
  fill: "#68c3d4",
  stroke: "transparent",
  lineWidth: 1,
};

class Shape implements IShape {
  public fill: string;
  public stroke: string;
  public lineWidth: number;
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;

  constructor(config: ShapeConfig = {}) {
    const {
      position,
      anchor,
      scale,
      pivot,
      angle,
      alpha,
      dead,
      fill,
      stroke,
      lineWidth,
    } = { ...IENTITY_DEFAULTS, ...SHAPE_DEFAULTS, ...config };

    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
    this.fill = fill;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
  }

  public render(context: CanvasRenderingContext2D) {}

  public update(delta: number, elapsed: number) {}
}

// // RECT
class Rect extends Shape {
  private _width: number;
  private _height: number;

  constructor(config: ShapeConfig & { width: number; height: number }) {
    const { width, height } = config;
    super(config);
    this._width = width;
    this._height = height;
  }

  get width(): number {
    return this._width * this.scale.x;
  }

  get height(): number {
    return this._height * this.scale.y;
  }

  public render(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.rect(0, 0, this.width, this.height);
    context.fillStyle = this.fill;
    context.fill();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.stroke;
    context.stroke();
  }
}

// // CIRCLE
class Circle extends Shape {
  radius: number;

  constructor(config: ShapeConfig & { radius: number }) {
    const { radius } = config;
    super({
      ...config,
    });
    this.radius = config.radius;
    this.anchor = new Vector(this.radius, this.radius);
  }

  get width(): number {
    return this.radius * 2 * this.scale.x;
  }

  get height(): number {
    return this.radius * 2 * this.scale.y;
  }

  render(context: CanvasRenderingContext2D): void {
    const { fill, stroke, lineWidth } = this;
    const { radius } = this;
    context.fillStyle = fill;
    context.lineWidth = lineWidth;
    context.strokeStyle = stroke;
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
  }

  public update(dt: number, t: number): void {}
}

export { Rect, Circle };
