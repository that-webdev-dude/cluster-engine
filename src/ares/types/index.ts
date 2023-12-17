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
  /**
   * render
   * @param {CanvasRenderingContext2D} context
   * @memberof Renderable
   * @returns {void}
   */
  render: (context: CanvasRenderingContext2D) => void;
};

type Updateable = {
  update: (delta: number, elapsed: number) => void;
};

type Resetable = {
  /**
   * reset
   * @memberof Resetable
   * @returns {void}
   */
  reset: () => void;
};

// type EntityType = Positionable &
//   Sizeable &
//   Rotatable &
//   Scalable &
//   Alphaable &
//   Deadable &
//   Renderable &
//   Updateable;

// type EntityContainerType = Positionable &
//   Updateable & {
//     add: (entity: EntityType | EntityContainerType) => void;
//     remove: (entity: EntityType | EntityContainerType) => void;
//     children: Array<EntityType | EntityContainerType>;
//     size: number;
//   };

type EntityType = Positionable &
  Sizeable &
  Rotatable &
  Scalable &
  Alphaable &
  Deadable &
  Renderable;

type EntityContainerType = Positionable &
  Updateable & {
    add: (entity: EntityType | EntityContainerType) => void;
    remove: (entity: EntityType | EntityContainerType) => void;
    children: Array<EntityType | EntityContainerType>;
    size: number;
  };

export {
  Locateable,
  Positionable,
  Sizeable,
  Rotatable,
  Scalable,
  Alphaable,
  Deadable,
  Renderable,
  Updateable,
  Resetable,
  EntityType,
  EntityContainerType,
};
