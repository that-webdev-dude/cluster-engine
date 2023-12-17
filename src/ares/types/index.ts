import Vector from "../tools/Vector";

type IEntityConfig = {
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  alpha?: number;
  dead?: boolean;
};

const IENTITY_DEFAULTS = {
  position: new Vector(0, 0),
  anchor: new Vector(0, 0),
  scale: new Vector(1, 1),
  pivot: new Vector(0, 0),
  angle: 0,
  alpha: 1,
  dead: false,
};

interface IEntity {
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  alpha: number;
  angle: number;
  dead: boolean;
  render: (context: CanvasRenderingContext2D) => void;
  update: (delta: number, elapsed: number) => void;
  reset?: () => void;
}

interface IEntityContainer {
  children: Array<IEntity | IEntityContainer>;
  position: Vector;
  size: number;
  update: (delta: number, elapsed: number) => void;
}

export { IEntity, IEntityConfig, IENTITY_DEFAULTS, IEntityContainer };

// NEW TYPE DEFINITIONS
// Path: src/ares/types/index.ts
// --------------------------------------------------------
type Positionable = {
  position: Vector;
  anchor: Vector;
};

type Sizeable = {
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

type Renderable = {
  render: (context: CanvasRenderingContext2D) => void;
};

type Updateable = {
  update: (delta: number, elapsed: number) => void;
};

type Resetable = {
  reset: () => void;
};

type Entity = Positionable &
  Sizeable &
  Rotatable &
  Scalable &
  Alphaable &
  Deadable &
  Renderable &
  Updateable &
  Resetable;

type EntityContainer = Positionable &
  Updateable &
  Resetable & {
    children: Array<Entity | EntityContainer>;
  };

export {
  Positionable,
  Sizeable,
  Rotatable,
  Scalable,
  Alphaable,
  Deadable,
  Renderable,
  Updateable,
  Resetable,
  Entity,
  EntityContainer,
};
