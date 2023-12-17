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
  /**
   * update
   * @param {number} delta
   * @param {number} elapsed
   * @memberof Updateable
   * @returns {void}
   */
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

// type Entity = Positionable &
//   Sizeable &
//   Rotatable &
//   Scalable &
//   Alphaable &
//   Deadable &
//   Renderable &
//   Updateable;

// type EntityContainer = Positionable &
//   Updateable & {
//     children: Array<Entity | EntityContainer>;
//     size: number;
//   };

type EntityType = Positionable &
  Sizeable &
  Rotatable &
  Scalable &
  Alphaable &
  Deadable &
  Renderable &
  Updateable;

type EntityContainerType = Positionable &
  Updateable & {
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
  // Entity,
  // EntityContainer,
  EntityType,
  EntityContainerType,
};
