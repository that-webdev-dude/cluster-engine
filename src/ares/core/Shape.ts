import Vector from "../tools/Vector";
import { EntityType } from "../types";

// SHAPE CLASS DEFINITION
interface IShape extends EntityType {
  fill: string;
  stroke: string;
  lineWidth: number;
}

interface IShapeConfig {
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  alpha?: number;
  dead?: boolean;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

class Shape implements IShape {
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;
  public fill: string;
  public stroke: string;
  public lineWidth: number;
  public hitbox?: { x: number; y: number; width: number; height: number };

  constructor({
    position = new Vector(),
    anchor = new Vector(),
    scale = new Vector(1, 1),
    pivot = new Vector(),
    angle = 0,
    alpha = 1,
    dead = false,
    fill = "#68c3d4",
    stroke = "transparent",
    lineWidth = 1,
  }: IShapeConfig) {
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

  // get width(): number {
  //   return 0;
  // }

  // get height(): number {
  //   return 0;
  // }

  public render(ctx: CanvasRenderingContext2D) {}
}

// RECT CLASS DEFINITION
interface IRectConfig extends IShapeConfig {
  width: number;
  height: number;
}

class Rect extends Shape {
  private _width: number;
  private _height: number;

  constructor({ width = 32, height = 32, ...superConfig }: IRectConfig) {
    super(superConfig);
    this._width = width;
    this._height = height;
  }

  get width(): number {
    return this._width * this.scale.x;
  }

  get height(): number {
    return this._height * this.scale.y;
  }

  public render(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.rect(0, 0, this.width, this.height);
    context.fillStyle = this.fill;
    context.fill();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.stroke;
    context.stroke();
  }
}

// CIRCLE CLASS DEFINITION
interface ICircleConfig extends IShapeConfig {
  radius: number;
}

class Circle extends Shape {
  public radius: number;

  constructor({ radius = 16, ...superConfig }: ICircleConfig) {
    super(superConfig);
    this.radius = radius;
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
    context.arc(radius, radius, radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
    context.stroke();
  }
}

export { Rect, Circle };
