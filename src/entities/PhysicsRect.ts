import { Rect, Vector } from "../ares";

enum PhysicsType {
  KINEMAIC,
  DYNAMIC,
}

type PhysicsRectConfig = {
  position: Vector;
  height: number;
  width: number;
  fill: string;
  mass?: number;
  velocity?: Vector;
  acceleration?: Vector;
  physicsType?: PhysicsType;
};

class PhysicsRect extends Rect {
  mass: number;
  velocity: Vector;
  acceleration: Vector;
  physicsType: PhysicsType;
  constructor(config: PhysicsRectConfig) {
    super({
      position: config.position,
      size: new Vector(config.width, config.height),
      style: {
        fill: config.fill,
      },
    });
    this.mass = config.mass || 1;
    this.velocity = config.velocity || new Vector();
    this.acceleration = config.acceleration || new Vector();
    this.physicsType = config.physicsType || PhysicsType.KINEMAIC;
    // this.hitbox = {
    //   x: this.position.x,
    //   y: this.position.y,
    //   width: this.width,
    //   height: this.height,
    // };
  }

  get direction(): Vector {
    return this.velocity.clone().normalize();
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.width * 0.5,
      this.position.y + this.height * 0.5
    );
  }
}

export default PhysicsRect;
