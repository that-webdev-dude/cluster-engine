import { Vector } from "../tools/Vector";

/** Namespace containing types and utilities for Cluster entities. */
export namespace Cluster {
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
    /** Indicates if the entity is solid. */
    mass?: number;
  }

  /** Represents specific properties of a rectangle entity. */
  export interface RectOptions extends BaseEntityOptions {
    /** Width of the rectangle. */
    width: number;
    /** Height of the rectangle. */
    height: number;
    /** Style of the rectangle. */
    style?: ShapeStyle;
    /** Hitbox of the rectangle. */
    hitbox?: Box;
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
  }

  /** Represents the type of an entity. */
  export type EntityType<T> = Properties<T & { tag: EntityTag }>;

  /** Represents the type of an entity container. */
  export type EntityContainerType<T> = Properties<
    EntityType<T> & { children: Array<EntityType<T> | EntityContainerType<T>> }
  >;
}
