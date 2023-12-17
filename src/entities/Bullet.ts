import { Vector, TileSprite } from "../ares";
import bulletsImageURL from "../images/bullets.png";

type BulletConfig = {
  frame: { x: number; y: number };
  damage: number;
  velocity: Vector;
  position: Vector;
  scale?: Vector;
};

class Bullet extends TileSprite {
  public velocity: Vector;
  public damage: number;

  constructor(config: BulletConfig) {
    const {
      frame,
      damage,
      velocity,
      position,
      scale = new Vector(0.5, 0.5),
    } = config;
    super({
      tileH: 12,
      tileW: 12,
      frame: frame,
      position: position,
      textureURL: bulletsImageURL,
      scale: scale,
    });
    this.velocity = velocity;
    this.damage = damage;
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }
}

export default Bullet;
