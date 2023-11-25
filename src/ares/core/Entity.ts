import Vector from "../tools/Vector";
import { Renderable } from "../types";

// Entity
type EntityConfig = {
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  height?: number;
  width?: number;
  angle?: number;
  alpha?: number;
  dead?: boolean;
};

const ENTITY_DEFAULTS = {
  position: new Vector(0, 0),
  anchor: new Vector(0, 0),
  scale: new Vector(1, 1),
  pivot: new Vector(0, 0),
  height: 0,
  width: 0,
  angle: 0,
  alpha: 1,
  dead: false,
};

class Entity implements Renderable {
  private _height: number;
  private _width: number;
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;

  constructor(config: EntityConfig) {
    const {
      position,
      anchor,
      scale,
      pivot,
      height,
      width,
      angle,
      alpha,
      dead,
    } = { ...ENTITY_DEFAULTS, ...config };
    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this._height = height;
    this._width = width;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
  }

  get height(): number {
    return this._height * this.scale.y;
  }

  get width(): number {
    return this._width * this.scale.x;
  }

  public render(context: CanvasRenderingContext2D): void {}

  public update?(dt: number, t: number): void {}
}

export { Entity, EntityConfig, ENTITY_DEFAULTS };
