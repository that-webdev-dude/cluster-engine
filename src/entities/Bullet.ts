import { Vector, TileSprite } from "../ares";
import bulletsImageURL from "../images/bullets.png";

// BulletFrames class definition (for the spritesheet)
interface IBulletFrame {
  x: number;
  y: number;
}

class BulletFrame {
  public static get PLAYER(): IBulletFrame {
    return { x: 0, y: 0 };
  }

  public static get ENEMY(): IBulletFrame {
    return { x: 2, y: 0 };
  }
}

// BulletDirection
enum BulletDirection {
  LEFT = -1,
  RIGHT = 1,
}

const DEFAULTS = {
  DAMAGE: 1,
  SCALE: new Vector(1, 1),
  VELOCITY: new Vector(500, 0),
  POSITION: new Vector(),
  DIRECTION: BulletDirection.RIGHT,
  FRAME: BulletFrame.PLAYER,
};

// Bullet class definition
interface IBulletConfig {
  damage?: number;
  frame?: { x: number; y: number };
  scale?: Vector;
  velocity?: Vector;
  position?: Vector;
  direction?: BulletDirection;
}

class Bullet extends TileSprite {
  public direction: BulletDirection;
  public velocity: Vector;
  public damage: number;

  constructor(config: IBulletConfig) {
    const {
      damage = DEFAULTS.DAMAGE,
      frame = DEFAULTS.FRAME,
      scale = DEFAULTS.SCALE,
      velocity = DEFAULTS.VELOCITY,
      position = DEFAULTS.POSITION,
      direction = DEFAULTS.DIRECTION,
    } = config;
    super({
      tileH: 12,
      tileW: 12,
      frame,
      scale,
      position,
      textureURL: bulletsImageURL,
    });
    this.damage = damage;
    this.velocity = velocity;
    this.direction = direction || BulletDirection.RIGHT;
  }

  get hitbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  public reset(config: IBulletConfig): void {
    const {
      damage = this.damage,
      frame = this.frame,
      scale = this.scale,
      velocity = this.velocity,
      position = this.position,
      direction = this.direction,
    } = config;

    this.damage = damage;
    this.frame = frame;
    this.scale = scale;
    this.velocity = velocity;
    this.position = position;
    this.direction = direction;
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    this.position.x += this.direction * this.velocity.x * dt;
    this.position.y += this.direction * this.velocity.y * dt;
  }
}

export { Bullet, BulletFrame };
