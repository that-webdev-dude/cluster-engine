import Vector from "../tools/Vector";

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

type Taggable = {
  tag: string;
};

type Hittable = {
  hitbox: Coordinates & Measurable;
};

type Collidable = {
  hitbox: Coordinates & Measurable; // made optional for now
};

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
  Taggable,
  Hittable,
  Collidable,
  Coordinates,
  Milliseconds,
  Seconds,
  Degrees,
  Radians,
  Pixels,
};

type EntityType = Positionable &
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

type ContainerType = Positionable &
  Deadable &
  Sizeable & {
    children: Array<ContainerType | EntityType>;
    update?: (dt: Milliseconds, t: Seconds) => void;
  };

export { ContainerType, EntityType };
