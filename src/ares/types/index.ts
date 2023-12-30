import Vector from "../tools/Vector";

type milliseconds = number;

type seconds = number;

type degrees = number;

type radians = number;

type pixels = number;

type Locateable = {
  x: pixels;
  y: pixels;
};

type Positionable = {
  position: Vector;
  anchor: Vector;
};

type Sizeable = {
  width?: pixels;
  height?: pixels;
};

// type Sizeable = {
//   size: number;
// };

type Measurable = {
  width: pixels;
  height: pixels;
};

type Rotatable = {
  pivot: Vector;
  angle: radians;
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

type Collidable = {
  hitbox?: Locateable & Sizeable; // made optional for now
};

type Renderable = {
  render: (context: CanvasRenderingContext2D) => void;
};

type Updateable = {
  update: (delta: milliseconds, elapsed: seconds) => void;
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
  Collidable,
  Renderable,
  Updateable,
  Resetable,
  EntityType,
  EntityContainerType,
  milliseconds,
  seconds,
  degrees,
  radians,
  pixels,
};
