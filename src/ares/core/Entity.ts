import { EntityType } from "../types";
import Vector from "../tools/Vector";

interface IEntity extends EntityType {}

interface IEntityConfig {
  position?: Vector;
  anchor?: Vector;
  height?: number;
  width?: number;
  angle?: number;
  pivot?: Vector;
  scale?: Vector;
  alpha?: number;
  dead?: boolean;
}

const ENTITY_DEFAULTS = {
  position: new Vector(0, 0),
  anchor: new Vector(0, 0),
  scale: new Vector(1, 1),
  pivot: new Vector(0, 0),
  angle: 0,
  alpha: 1,
  dead: false,
};

class Entity implements IEntity {
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;

  constructor(config: IEntityConfig = {}) {
    const { position, anchor, scale, pivot, angle, alpha, dead } = {
      ...ENTITY_DEFAULTS,
      ...config,
    };

    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
  }

  get width(): number {
    return 0;
  }

  get height(): number {
    return 0;
  }

  public render(context: CanvasRenderingContext2D) {}

  public update(delta: number, elapsed: number) {}
}

export { Entity, IEntity, IEntityConfig, ENTITY_DEFAULTS };
export default Entity;
