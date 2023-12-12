import Vector from "../tools/Vector";
import { IEntity } from "../types";

type EntityConfig = {
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  alpha?: number;
  dead?: boolean;
};

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

  constructor(config: EntityConfig = {}) {
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

  public render(context: CanvasRenderingContext2D) {}

  public update(delta: number, elapsed: number) {}
}

export type { EntityConfig };
export default Entity;
