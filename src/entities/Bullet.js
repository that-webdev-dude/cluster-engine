import bulletImageURL from "../images/blue_bullet.png";
import cluster from "../cluster";

const { Texture, Sprite } = cluster;

class Bullet extends Sprite {
  constructor() {
    super(new Texture(bulletImageURL));
    this.speed = 600;
    this.dead = true;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  update(dt, t) {
    this.position.x += this.speed * dt;
  }
}

export default Bullet;
