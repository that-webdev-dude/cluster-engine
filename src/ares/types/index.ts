import Vector from "../tools/Vector";
import Animation from "../core/Animation";

// utility types
export type Milliseconds = number;

export type Seconds = number;

export type Degrees = number;

export type Radians = number;

export type Pixels = number;

export type Point = {
  x: Pixels;
  y: Pixels;
};

export type size = {
  width: Pixels;
  height: Pixels;
};

export type Box = Point & size;

// component types
export type Positionable = {
  position: Vector;
  anchor: Vector;
};

export type Moveable = {
  acceleration: Vector;
  velocity: Vector;
  mass: number;
};

export type Sizeable = {
  size: number;
};

export type Measurable = {
  width: Pixels;
  height: Pixels;
};

export type Rotatable = {
  pivot: Vector;
  angle: Radians;
};

export type Scalable = {
  scale: Vector;
};

export type Alphaable = {
  alpha: number;
};

export type Visible = {
  visible: boolean;
};

export type Deadable = {
  dead: boolean;
};

export type Hittable = {
  hitbox: Point & Measurable;
  hitBounds: Point & Measurable;
};

export type Taggable = {
  tag: string;
};

export type Identifiable = {
  id: string;
};

// entity types
export type EntityType = {
  id: string;
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: Radians;
  alpha: number;
  dead: boolean;
  visible: boolean;
};

export type RectType = EntityType & {
  tag: string;
  size: Vector;
  fill: string;
  stroke: string;
  lineWidth: number;
  hitbox: Box;
} & {
  width: number;
  height: number;
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  center: Vector;
  bounds: Box;
  hitBounds: Box;
};

export type CircleType = EntityType & {
  tag: string;
  radius: number;
  fill: string;
  stroke: string;
  lineWidth: number;
} & {
  diameter: number;
  width: number;
  height: number;
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  center: Vector;
  bounds: Box;
  hitBounds: Box;
};

export type LineType = EntityType & {
  tag: string;
  start: Vector;
  end: Vector;
  stroke: string;
  lineWidth: number;
} & {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  center: Vector;
  bounds: Box;
};

export type TextType = EntityType & {
  tag: string;
  text: string;
  font: string;
  fill: string;
  stroke: string;
  lineWidth: number;
  align: CanvasTextAlign;
};

export type SpriteType = EntityType & {
  tag: string;
  image: HTMLImageElement;
  animation: Animation;
  tileW: number;
  tileH: number;
  tile: Point;
} & {
  frame: Point;
  width: number;
  height: number;
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  center: Vector;
  bounds: Box;
  hitBounds: Box;
} & {
  update: (dt: Milliseconds, t: Seconds) => void;
};

// containers
export type ContainerType = {
  position: Vector;
  anchor: Vector;
  dead: boolean;
  size: number;
  children: Array<ContainerType | EntityType>;
  update: (dt: Milliseconds, t: Seconds) => void;
};
