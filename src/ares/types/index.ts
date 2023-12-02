import Vector from "../tools/Vector";

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
}

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

interface IEntityContainer {
  children: Array<IEntity | IEntityContainer>;
  position: Vector;
  size: number;
  update: (delta: number, elapsed: number) => void;
}

export { IEntity, IEntityConfig, IENTITY_DEFAULTS, IEntityContainer };
