import Vector from "../tools/Vector";

type Milliseconds = number;

type Seconds = number;

type Degrees = number;

type Radians = number;

type Pixels = number;

type Locateable = {
  x: Pixels;
  y: Pixels;
};

type Positionable = {
  position: Vector;
  anchor: Vector;
};

type Sizeable = {
  width?: Pixels;
  height?: Pixels;
};

// type Sizeable = {
//   size: number;
// };

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

type Deadable = {
  dead: boolean;
};

type Visible = {
  visible: boolean;
};

type Collidable = {
  hitbox?: Locateable & Sizeable; // made optional for now
};

type Renderable = {
  render: (context: CanvasRenderingContext2D) => void;
};

type Updateable = {
  update: (delta: Milliseconds, elapsed: Seconds) => void;
};

type Resetable = {
  reset: () => void;
};

type EntityType = Positionable &
  Sizeable &
  Rotatable &
  Scalable &
  Alphaable &
  Collidable &
  Renderable &
  Deadable;

type ContainerType = Positionable &
  Updateable &
  Deadable & {
    children: Array<ContainerType | Deadable>;
    size: number;
  };

export {
  Locateable,
  Positionable,
  Measurable,
  Sizeable,
  Rotatable,
  Scalable,
  Alphaable,
  Deadable,
  Visible,
  Collidable,
  Renderable,
  Updateable,
  Resetable,
  Milliseconds,
  Seconds,
  Degrees,
  Radians,
  Pixels,
};

export { ContainerType, EntityType };
