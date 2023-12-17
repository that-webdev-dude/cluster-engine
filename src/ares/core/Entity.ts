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
  // static hitTest(a: Entity, b: Entity): boolean {
  //   const hitBoundsA = a.hitBounds;
  //   const hitBoundsB = b.hitBounds;
  //   return (
  //     hitBoundsA.x < hitBoundsB.x + hitBoundsB.width &&
  //     hitBoundsA.x + hitBoundsA.width > hitBoundsB.x &&
  //     hitBoundsA.y < hitBoundsB.y + hitBoundsB.height &&
  //     hitBoundsA.y + hitBoundsA.height > hitBoundsB.y
  //   );
  // }

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

  get width(): number {
    return 0;
  }

  get height(): number {
    return 0;
  }

  // /**
  //  * Returns the center of the entity
  //  * @returns {Vector}
  //  * @memberof Entity
  //  */
  // get center(): Vector {
  //   return new Vector(
  //     this.position.x + this.width / 2,
  //     this.position.y + this.height / 2
  //   );
  // }

  // /**
  //  * Returns the hitbox of the entity
  //  * @returns {{ x: number; y: number; width: number; height: number }}
  //  * @memberof Entity
  //  */
  // get hitBox(): {
  //   x: number;
  //   y: number;
  //   width: number;
  //   height: number;
  // } {
  //   return {
  //     x: this.position.x,
  //     y: this.position.y,
  //     width: this.width,
  //     height: this.height,
  //   };
  // }

  // /**
  //  * Returns the hitbounds of the entity
  //  * @returns {{ x: number; y: number; width: number; height: number }}
  //  * @memberof Entity
  //  */
  // get hitBounds(): {
  //   x: number;
  //   y: number;
  //   width: number;
  //   height: number;
  // } {
  //   const { position, hitBox } = this;
  //   return {
  //     x: position.x + hitBox.x,
  //     y: position.y + hitBox.y,
  //     width: hitBox.width,
  //     height: hitBox.height,
  //   };
  // }

  public render(context: CanvasRenderingContext2D) {}

  public update(delta: number, elapsed: number) {}
}

export type { EntityConfig };
export default Entity;
