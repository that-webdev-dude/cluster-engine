import Vector from "../tools/Vector";
import Container from "./Container";

type EntityOptions = {
  position?: Vector;
  anchor?: Vector;
  height?: number;
  width?: number;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  dead?: boolean;
  alpha?: number;
  visible?: boolean;
};

abstract class Entity {
  private _height: number;
  private _width: number;
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public dead: boolean;
  public alpha: number;
  public visible: boolean;

  constructor({
    position = new Vector(),
    anchor = new Vector(),
    height = 0,
    width = 0,
    scale = new Vector(1, 1),
    pivot = new Vector(),
    angle = 0,
    dead = false,
    alpha = 1,
    visible = true,
  }: EntityOptions = {}) {
    this._height = height;
    this._width = width;
    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.dead = dead;
    this.alpha = alpha;
    this.visible = visible;
  }

  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  public update?(dt: number, t: number, parent?: Container): void {}
  // abstract update(dt: number, t: number, parent?: Container): void;
}

export { EntityOptions, Entity };
