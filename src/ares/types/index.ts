import Vector from "../tools/Vector";
import Animation from "../core/Animation";

// utility types
type Milliseconds = number;

type Seconds = number;

type Degrees = number;

type Radians = number;

type Pixels = number;

type Coordinates = {
  x: Pixels;
  y: Pixels;
};

// component types
type Positionable = {
  position: Vector;
  anchor: Vector;
};

type Moveable = {
  acceleration: Vector;
  velocity: Vector;
  mass: number;
};

type Sizeable = {
  size: number;
};

type Measurable = {
  width: Pixels;
  height: Pixels;
};

type Rotatable = {
  pivot: Vector;
  angle: Radians;
};

type Scalable = {
  scale: Vector;
};

type Alphaable = {
  alpha: number;
};

type Visible = {
  visible: boolean;
};

type Deadable = {
  dead: boolean;
};

type Hittable = {
  hitbox: Coordinates & Measurable;
  hitBounds: Coordinates & Measurable;
};

type Taggable = {
  tag: string;
};

type Identifiable = {
  id: string;
};

// entity types
type EntityType = Positionable &
  Identifiable &
  Moveable &
  Rotatable &
  Alphaable &
  Scalable &
  Deadable &
  Visible & {
    update?: (dt: number, t: number) => void;
    render?: (context: CanvasRenderingContext2D) => void;
    reset?: () => void;
  };

type RectType = EntityType &
  Measurable &
  Hittable &
  Taggable & {
    fill: string;
    stroke: string;
    lineWidth: number;
    direction: Vector;
    center: Vector;
  };

type CircleType = EntityType &
  Measurable &
  Taggable & {
    radius: number;
    fill: string;
    stroke: string;
    lineWidth: number;
    direction: Vector;
    center: Vector;
  };

type LineType = EntityType &
  Measurable &
  Taggable & {
    start: Vector;
    end: Vector;
    stroke: string;
    lineWidth: number;
    direction: Vector;
    center: Vector;
  };

type TextType = EntityType &
  Taggable & {
    text: string;
    font: string;
    fill: string;
    align: string;
    stroke: string;
    lineWidth: number;
  };

type SpriteType = EntityType &
  Measurable &
  Hittable &
  Taggable & {
    image: HTMLImageElement;
    direction: Vector;
    center: Vector;
  };

type TileSpriteType = SpriteType & {
  animation: Animation;
  frame: { x: number; y: number };
};

// containers
type ContainerType = Positionable &
  Deadable &
  Sizeable & {
    children: Array<ContainerType | EntityType>;
    update?: (dt: Milliseconds, t: Seconds) => void;
  };

export { Coordinates, Milliseconds, Seconds, Degrees, Radians, Pixels };

export {
  Positionable,
  Moveable,
  Measurable,
  Sizeable,
  Rotatable,
  Scalable,
  Alphaable,
  Deadable,
  Visible,
  Hittable,
};

export {
  ContainerType,
  EntityType,
  RectType,
  CircleType,
  LineType,
  TextType,
  SpriteType,
  TileSpriteType,
};
