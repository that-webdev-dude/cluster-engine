import Vector from "../tools/Vector";
import { EntityType } from "../types";

type EntityConfig = Partial<{
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  anchor: Vector;
  pivot: Vector;
  scale: Vector;
  angle: number;
  alpha: number;
  mass: number;
  dead: boolean;
  visible: boolean;
}>;

abstract class Entity implements EntityType {
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  anchor: Vector;
  pivot: Vector;
  scale: Vector;
  angle: number;
  alpha: number;
  mass: number;
  dead: boolean;
  visible: boolean;

  constructor(config: EntityConfig = {}) {
    const {
      acceleration = new Vector(0, 0),
      velocity = new Vector(0, 0),
      position = new Vector(0, 0),
      anchor = new Vector(0, 0),
      pivot = new Vector(0, 0),
      scale = new Vector(1, 1),
      angle = 0,
      alpha = 1,
      mass = 1,
      dead = false,
      visible = true,
    } = { ...config };

    this.acceleration = acceleration;
    this.velocity = velocity;
    this.position = position;
    this.anchor = anchor;
    this.pivot = pivot;
    this.scale = scale;
    this.angle = angle;
    this.alpha = alpha;
    this.mass = mass;
    this.dead = dead;
    this.visible = visible;
  }

  abstract get center(): Vector;

  get direction(): Vector {
    return this.velocity.clone().normalize();
  }
}

export { Entity, EntityConfig, EntityType };
