import Vector from "../tools/Vector";

// type milliseconds = number;
type Milliseconds = number;

// type seconds = number;
type Seconds = number;

// type degrees = number;
type Degrees = number;

// type radians = number;
type Radians = number;

// type pixels = number;
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
  Deadable &
  Collidable &
  Renderable;

type EntityContainerType = Positionable &
  Updateable &
  Deadable & {
    children: Array<EntityType | EntityContainerType>;
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
  EntityType,
  EntityContainerType,
  // milliseconds, // not used
  // seconds, // not used
  // degrees, // not used
  // radians, // not used
  // pixels, // not used
  Milliseconds,
  Seconds,
  Degrees,
  Radians,
  Pixels,
};
