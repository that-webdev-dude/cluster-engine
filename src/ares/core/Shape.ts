import Vector from "../tools/Vector";
import { Entity, EntityConfig } from "./Entity";
import { CircleType } from "../types";
import { RectType } from "../types";
import { LineType } from "../types";

const DEFAULT_STYLE = {
  fill: "lightBlue",
  stroke: "transparent",
  lineWidth: 1,
};

type RectConfig = EntityConfig &
  Partial<{
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    height?: number;
    width?: number;
    hitbox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;

class Rect extends Entity implements RectType {
  readonly tag: string;
  private _width: number;
  private _height: number;
  private _hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  fill: string;
  stroke: string;
  lineWidth: number;

  constructor(config: RectConfig = {}) {
    const {
      fill = DEFAULT_STYLE.fill,
      stroke = DEFAULT_STYLE.stroke,
      lineWidth = DEFAULT_STYLE.lineWidth,
      height = 32,
      width = 32,
      hitbox,
    } = config;

    super(config);
    this.tag = "rect";
    this.fill = fill;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
    this._height = height;
    this._width = width;
    this._hitbox = hitbox || null;
  }

  get hitbox(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return (
      this._hitbox || {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      }
    );
  }

  set hitbox(hitbox: { x: number; y: number; width: number; height: number }) {
    this._hitbox = hitbox;
  }

  get width(): number {
    return this._width * this.scale.x;
  }

  get height(): number {
    return this._height * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.width * 0.5,
      this.position.y + this.height * 0.5
    );
  }

  get direction(): Vector {
    return Vector.clone(this.velocity).normalize();
  }

  get hitBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x + this.hitbox.x,
      y: this.position.y + this.hitbox.y,
      width: this.hitbox.width,
      height: this.hitbox.height,
    };
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

// CIRCLE ENTITY
type CircleConfig = EntityConfig &
  Partial<{
    radius: number;
    fill: string;
    stroke: string;
    lineWidth: number;
  }>;

class Circle extends Entity implements CircleType {
  readonly tag: string;
  radius: number;
  fill: string;
  stroke: string;
  lineWidth: number;
  constructor(config: CircleConfig) {
    const {
      radius = 100,
      fill = DEFAULT_STYLE.fill,
      stroke = DEFAULT_STYLE.stroke,
      lineWidth = DEFAULT_STYLE.lineWidth,
    } = config;

    super(config);
    this.tag = "circle";
    this.radius = radius;
    this.fill = fill || DEFAULT_STYLE.fill;
    this.stroke = stroke || DEFAULT_STYLE.stroke;
    this.lineWidth = lineWidth || DEFAULT_STYLE.lineWidth;
  }

  get width(): number {
    return this.radius * 2 * this.scale.x;
  }

  get height(): number {
    return this.radius * 2 * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.radius * this.scale.x,
      this.position.y + this.radius * this.scale.y
    );
  }

  get direction(): Vector {
    return Vector.clone(this.velocity).normalize();
  }

  public render(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.fill;
    context.fill();
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.stroke;
    context.stroke();
  }
}

// LINE ENTITY
type LineConfig = EntityConfig &
  Partial<{
    start: Vector;
    end: Vector;
    stroke: string;
    lineWidth: number;
  }>;

class Line extends Entity implements LineType {
  readonly tag: string;
  start: Vector;
  end: Vector;
  stroke: string;
  lineWidth: number;
  constructor(config: LineConfig) {
    const {
      start = new Vector(),
      end = new Vector(100, 100),
      stroke = "black",
      lineWidth = 1,
    } = config;

    super(config);
    this.start = start;
    this.end = end;
    this.tag = "line";
    this.stroke = stroke;
    this.lineWidth = lineWidth;
  }

  get width(): number {
    return Math.abs(this.end.x - this.position.x) * this.scale.x;
  }

  get height(): number {
    return Math.abs(this.end.y - this.position.y) * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.width * 0.5,
      this.position.y + this.height * 0.5
    );
  }

  get direction(): Vector {
    return Vector.clone(this.velocity).normalize();
  }

  public render(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.end.x, this.end.y);
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.stroke;
    context.stroke();
  }
}

export { Line, Rect, Circle };
