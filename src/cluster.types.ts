import { Vector } from "./ares";

export namespace Cluster {
  export type Properties<T> = {
    [K in keyof T]: T[K];
  };

  export type Milliseconds = number;
  export type Seconds = number;
  export type Point = {
    x: number;
    y: number;
  };

  export type Box = Point & {
    width: number;
    height: number;
  };

  type LineStyle = {
    stroke?: string;
  };
  type ShapeStyle = LineStyle & {
    fill?: string;
    lineWidth?: number;
  };
  type TextStyle = ShapeStyle & {
    font?: string;
    align?: CanvasTextAlign;
  };

  export enum EntityTag {
    RECT = "rectangle",
    CIRCLE = "circle",
    LINE = "line",
    TEXT = "text",
    SPRITE = "sprite",
    TILESPRITE = "tileSprite",
    CONTAINER = "container",
  }

  export type EntityOptions = Partial<{
    position: Vector;
    anchor: Vector;
    scale: Vector;
    pivot: Vector;
    angle: number;
    alpha: number;
    dead: boolean;
    visible: boolean;
  }>;
  export type EntityType = Properties<
    EntityOptions & {
      tag: EntityTag;
    }
  >;

  export type EntityContainerOptions = EntityOptions;
  export type EntityContainerType = Properties<
    EntityType & {
      children: Array<EntityType | EntityContainerType>;
    }
  >;

  type RectSpecifics = {
    width: number;
    height: number;
    style?: ShapeStyle;
  };
  export type RectOptions = Properties<EntityOptions & RectSpecifics>;
  export type RectType = Properties<EntityType & RectSpecifics>;

  type CircleSpecifics = {
    radius: number;
    style?: ShapeStyle;
  };
  export type CircleOptions = Properties<EntityOptions & CircleSpecifics>;
  export type CircleType = Properties<EntityType & CircleSpecifics>;

  type LineSpecifics = {
    start: Vector;
    end: Vector;
    style?: LineStyle;
  };
  export type LineOptions = Properties<EntityOptions & LineSpecifics>;
  export type LineType = Properties<EntityType & LineSpecifics>;

  type TextSpecifics = {
    text: string;
    style?: TextStyle;
  };
  export type TextOptions = Properties<EntityOptions & TextSpecifics>;
  export type TextType = Properties<EntityType & TextSpecifics>;

  type SpriteSpecifics = {
    image: HTMLImageElement;
  };
  export type SpriteOptions = Properties<EntityOptions & SpriteSpecifics>;
  export type SpriteType = Properties<EntityType & SpriteSpecifics>;

  type TileSpriteSpecifics = {
    tileWidth: number;
    tileHeight: number;
  };
  export type TileSpriteOptions = Properties<
    SpriteOptions & TileSpriteSpecifics
  >;
  export type TileSpriteType = Properties<
    SpriteType & TileSpriteSpecifics & { frame: Point }
  >;
}
