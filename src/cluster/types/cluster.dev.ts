import { Vector } from "../tools/Vector";

/** Namespace containing types and utilities for clustering entities. */
export namespace Dev {
  /** Represents properties of a generic type. */
  export type Properties<T> = { [K in keyof T]: T[K] };

  /** Represents time in milliseconds. */
  export type Milliseconds = number;

  /** Represents time in seconds. */
  export type Seconds = number;

  /** Represents a point in 2D space. */
  export type Point = {
    x: number;
    y: number;
  };

  /** Represents a box in 2D space. */
  export type Box = Point & {
    /** Width of the box. */
    width: number;
    /** Height of the box. */
    height: number;
  };

  /** Represents the style of a line. */
  export type LineStyle = {
    /** Stroke color. */
    stroke?: string;
  };

  /** Represents the style of a shape. */
  export type ShapeStyle = LineStyle & {
    /** Fill color. */
    fill?: string;
    /** Width of the line. */
    lineWidth?: number;
  };

  /** Represents the style of a text. */
  export type TextStyle = ShapeStyle & {
    /** Font style. */
    font?: string;
    /** Text alignment. */
    align?: CanvasTextAlign;
  };

  /** Represents tags for different entity types. */
  export enum EntityTag {
    RECT = "rectangle",
    CIRCLE = "circle",
    LINE = "line",
    TEXT = "text",
    SPRITE = "sprite",
    TILESPRITE = "tileSprite",
    CONTAINER = "container",
  }

  /** Represents options for an entity. */
  export interface BaseEntityOptions {
    /** Acceleration vector. */
    acceleration?: Vector;
    /** Velocity vector. */
    velocity?: Vector;
    /** Position vector. */
    position?: Vector;
    /** Anchor vector. */
    anchor?: Vector;
    /** Scale vector. */
    scale?: Vector;
    /** Pivot vector. */
    pivot?: Vector;
    /** Angle in radians. */
    angle?: number;
    /** Opacity value. */
    alpha?: number;
    /** Indicates if the entity is dead. */
    dead?: boolean;
    /** Indicates if the entity is visible. */
    visible?: boolean;
  }

  /** Represents specific properties of a rectangle entity. */
  export interface RectOptions extends BaseEntityOptions {
    /** Width of the rectangle. */
    width: number;
    /** Height of the rectangle. */
    height: number;
    /** Style of the rectangle. */
    style?: ShapeStyle;
  }

  /** Represents specific properties of a circle entity. */
  export interface CircleOptions extends BaseEntityOptions {
    /** Radius of the circle. */
    radius: number;
    /** Style of the circle. */
    style?: ShapeStyle;
  }

  /** Represents specific properties of a line entity. */
  export interface LineOptions extends Omit<BaseEntityOptions, "position"> {
    /** Starting point of the line. */
    start: Vector;
    /** Ending point of the line. */
    end: Vector;
    /** Style of the line. */
    style?: LineStyle;
  }

  /** Represents specific properties of a text entity. */
  export interface TextOptions extends BaseEntityOptions {
    /** Text content. */
    text: string;
    /** Style of the text. */
    style?: TextStyle;
  }

  /** Represents specific properties of a sprite entity. */
  export interface SpriteOptions extends BaseEntityOptions {
    /** Image URL of the sprite. */
    imageURL: string;
  }

  /** Represents specific properties of a tile sprite entity. */
  export interface TileSpriteOptions extends SpriteOptions {
    /** Width of each tile. */
    tileWidth: number;
    /** Height of each tile. */
    tileHeight: number;
    /** Frame position. */
    frame: Point;
  }

  /** Represents the type of an entity. */
  export type EntityType<T> = Properties<T & { tag: EntityTag }>;

  /** Represents the type of an entity container. */
  export type EntityContainerType<T> = Properties<
    EntityType<T> & { children: Array<EntityType<T> | EntityContainerType<T>> }
  >;
}

// implementation of a Base Entity class
export abstract class DevEntity
  implements Dev.EntityType<Dev.BaseEntityOptions>
{
  readonly tag: Dev.EntityTag; // Discriminant property
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  alpha: number;
  dead: boolean;
  visible: boolean;

  constructor(tag: Dev.EntityTag, options: Dev.BaseEntityOptions = {}) {
    this.tag = tag;
    this.acceleration = options.acceleration || new Vector(0, 0);
    this.velocity = options.velocity || new Vector(0, 0);
    this.position = options.position || new Vector(0, 0);
    this.anchor = options.anchor || new Vector(0, 0);
    this.scale = options.scale || new Vector(1, 1);
    this.pivot = options.pivot || new Vector(0, 0);
    this.angle = options.angle || 0;
    this.alpha = options.alpha || 1;
    this.dead = options.dead || false;
    this.visible = options.visible || true;
  }

  get direction() {
    return Vector.direction(this.velocity);
  }

  abstract get center(): Vector;
  abstract get width(): number;
  abstract get height(): number;
}

// implementation of a Rect Entity class
export class DevRect
  extends DevEntity
  implements Dev.EntityType<Dev.RectOptions>
{
  readonly tag = Dev.EntityTag.RECT; // Discriminant property
  width: number;
  height: number;
  style: Dev.ShapeStyle;

  constructor(options: Dev.RectOptions) {
    super(Dev.EntityTag.RECT, options);
    this.width = options.width;
    this.height = options.height;
    this.style = options.style || {};
  }

  get center() {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }
}

// implementation of a Circle Entity class
export class DevCircle
  extends DevEntity
  implements Dev.EntityType<Dev.CircleOptions>
{
  readonly tag = Dev.EntityTag.CIRCLE; // Discriminant property
  radius: number;
  style: Dev.ShapeStyle;

  constructor(options: Dev.CircleOptions) {
    super(Dev.EntityTag.CIRCLE, options);
    this.radius = options.radius;
    this.style = options.style || {};
  }

  get diameter() {
    return this.radius * 2;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.radius * 2;
  }

  get center() {
    return Vector.from(this.position);
  }
}

// implementation of a Line Entity class
export class DevLine
  extends DevEntity
  implements Dev.EntityType<Dev.LineOptions>
{
  readonly tag = Dev.EntityTag.LINE; // Discriminant property
  start: Vector;
  end: Vector;
  style: Dev.LineStyle;

  constructor(options: Dev.LineOptions) {
    super(Dev.EntityTag.LINE, options);
    this.start = options.start;
    this.end = options.end;
    this.style = options.style || {};
  }

  get length() {
    return Vector.distanceBetween(this.start, this.end);
  }

  get width() {
    return this.end.x - this.start.x;
  }

  get height() {
    return this.end.y - this.start.y;
  }

  get center() {
    return Vector.from(this.start).add(this.end).scale(0.5);
  }
}

// implementation of a Text Entity class
export class DevText
  extends DevEntity
  implements Dev.EntityType<Dev.TextOptions>
{
  readonly tag = Dev.EntityTag.TEXT; // Discriminant property
  text: string;
  style: Dev.TextStyle;

  constructor(options: Dev.TextOptions) {
    super(Dev.EntityTag.TEXT, options);
    this.text = options.text;
    this.style = options.style || {};
  }

  get width() {
    return 0;
  }

  get height() {
    return 0;
  }

  get center() {
    return new Vector(0, 0);
  }
}

// implementation of a Container Entity class
export class DevContainer
  implements Dev.EntityContainerType<Dev.BaseEntityOptions>
{
  readonly tag = Dev.EntityTag.CONTAINER; // Discriminant property
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  alpha: number;
  dead: boolean;
  visible: boolean;
  children: Array<
    | Dev.EntityType<Dev.BaseEntityOptions>
    | Dev.EntityContainerType<Dev.BaseEntityOptions>
  >;

  constructor(options: Dev.BaseEntityOptions = {}) {
    this.acceleration = options.acceleration || new Vector(0, 0);
    this.velocity = options.velocity || new Vector(0, 0);
    this.position = options.position || new Vector(0, 0);
    this.anchor = options.anchor || new Vector(0, 0);
    this.scale = options.scale || new Vector(1, 1);
    this.pivot = options.pivot || new Vector(0, 0);
    this.angle = options.angle || 0;
    this.alpha = options.alpha || 1;
    this.dead = options.dead || false;
    this.visible = options.visible || true;
    this.children = [];
  }

  add(entity: Dev.EntityType<Dev.BaseEntityOptions>) {
    this.children.push(entity);
  }

  remove(entity: Dev.EntityType<Dev.BaseEntityOptions>) {
    const index = this.children.indexOf(entity);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  update(dt: Dev.Milliseconds, t: Dev.Milliseconds) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child && child.update) {
        (child.update as (dt: Dev.Milliseconds, t: Dev.Milliseconds) => void)(
          dt,
          t
        );
      }

      // TODO
      // Use of Array.splice() in EntityContainer.update():
      // This can be performance-intensive for large arrays.
      // Consider using a different data structure, like a linked list,
      // for better performance when removing elements.
      if ("dead" in child && child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

// implementation of a Sprite Entity class
export class DevSprite
  extends DevEntity
  implements Dev.EntityType<Dev.SpriteOptions>
{
  readonly tag = Dev.EntityTag.SPRITE; // Discriminant property
  imageURL: string;

  constructor(options: Dev.SpriteOptions) {
    super(Dev.EntityTag.SPRITE, options);
    this.imageURL = options.imageURL;
  }

  get width() {
    return 0;
  }

  get height() {
    return 0;
  }

  get center() {
    return new Vector(0, 0);
  }
}

// implementation of a Tile Sprite Entity class
export class DevTileSprite
  extends DevSprite
  implements Dev.EntityType<Dev.TileSpriteOptions>
{
  tileWidth: number;
  tileHeight: number;
  frame: Dev.Point;

  constructor(options: Dev.TileSpriteOptions) {
    super(options);
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
    this.frame = options.frame;
  }

  get width() {
    return this.tileWidth;
  }

  get height() {
    return this.tileHeight;
  }

  get center() {
    return new Vector(0, 0);
  }
}
