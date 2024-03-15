import { Vector } from "../tools/Vector";

/**
 * Namespace containing types and utilities for clustering entities.
 */
export namespace Cluster {
  /**
   * Represents properties of a cluster entity.
   */
  export type Properties<T> = {
    [K in keyof T]: T[K];
  };

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

  /**
   * Represents options for an entity.
   * @deprecated Consider replacing this with a safer alternative.
   */
  export type EntityOptions = Partial<{
    /** Acceleration vector. */
    acceleration: Vector;
    /** Velocity vector. */
    velocity: Vector;
    /** Position vector. */
    position: Vector;
    /** Anchor vector. */
    anchor: Vector;
    /** Scale vector. */
    scale: Vector;
    /** Pivot vector. */
    pivot: Vector;
    /** Angle in radians. */
    angle: number;
    /** Opacity value. */
    alpha: number;
    /** Indicates if the entity is dead. */
    dead: boolean;
    /** Indicates if the entity is visible. */
    visible: boolean;
  }>;

  /** Represents the type of an entity. */
  export type EntityType = Properties<
    EntityOptions & {
      /** Tag of the entity. */
      tag: EntityTag;
    }
  >;

  /** Represents options for an entity container. */
  export type EntityContainerOptions = EntityOptions;

  /** Represents the type of an entity container. */
  export type EntityContainerType = Properties<
    EntityType & {
      /** Array of children entities. */
      children: Array<EntityType | EntityContainerType>;
    }
  >;

  /** Represents specific properties of a rectangle entity. */
  type RectSpecifics = {
    /** Width of the rectangle. */
    width: number;
    /** Height of the rectangle. */
    height: number;
    /** Style of the rectangle. */
    style?: ShapeStyle;
  };

  /** Represents options for a rectangle entity. */
  export type RectOptions = Properties<EntityOptions & RectSpecifics>;

  /** Represents the type of a rectangle entity. */
  export type RectType = Properties<EntityType & RectSpecifics>;

  /** Represents specific properties of a circle entity. */
  type CircleSpecifics = {
    /** Radius of the circle. */
    radius: number;
    /** Style of the circle. */
    style?: ShapeStyle;
  };

  /** Represents options for a circle entity. */
  export type CircleOptions = Properties<EntityOptions & CircleSpecifics>;

  /** Represents the type of a circle entity. */
  export type CircleType = Properties<EntityType & CircleSpecifics>;

  /** Represents specific properties of a line entity. */
  type LineSpecifics = {
    /** Starting point of the line. */
    start: Vector;
    /** Ending point of the line. */
    end: Vector;
    /** Style of the line. */
    style?: LineStyle;
  };

  /** Represents options for a line entity. */
  export type LineOptions = Properties<EntityOptions & LineSpecifics>;

  /** Represents the type of a line entity. */
  export type LineType = Properties<EntityType & LineSpecifics>;

  /** Represents specific properties of a text entity. */
  type TextSpecifics = {
    /** Text content. */
    text: string;
    /** Style of the text. */
    style?: TextStyle;
  };

  /** Represents options for a text entity. */
  export type TextOptions = Properties<EntityOptions & TextSpecifics>;

  /** Represents the type of a text entity. */
  export type TextType = Properties<EntityType & TextSpecifics>;

  /** Represents specific properties of a sprite entity. */
  type SpriteSpecifics = {
    /** Image of the sprite. */
    image: HTMLImageElement;
  };

  /** Represents options for a sprite entity. */
  export type SpriteOptions = Properties<EntityOptions & { imageURL: string }>;

  /** Represents the type of a sprite entity. */
  export type SpriteType = Properties<EntityType & SpriteSpecifics>;

  /** Represents specific properties of a tile sprite entity. */
  type TileSpriteSpecifics = {
    /** Width of each tile. */
    tileWidth: number;
    /** Height of each tile. */
    tileHeight: number;
  };

  /** Represents options for a tile sprite entity. */
  export type TileSpriteOptions = Properties<
    SpriteOptions & TileSpriteSpecifics
  >;

  /** Represents the type of a tile sprite entity. */
  export type TileSpriteType = Properties<
    SpriteType & TileSpriteSpecifics & { frame: Point }
  >;
}
