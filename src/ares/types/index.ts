import Vector from "../tools/Vector";

type Locateable = {
  x: number;
  y: number;
};

type Positionable = {
  position: Vector;
  anchor: Vector;
};

type Sizeable = {
  width?: number; // made optional for now (will be required in the derived classes)
  height?: number; // made optional for now (will be required in the derived classes)
};

// type Sizeable = {
//   size: number;
// };

type Measurable = {
  width: number;
  height: number;
};

type Rotatable = {
  pivot: Vector;
  angle: number;
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
  update: (delta: number, elapsed: number) => void;
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
};
