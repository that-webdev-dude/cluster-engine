import bulletImageURL from "../images/bullet.png";
import cluster from "../cluster";

const { Sprite, Texture, Vector } = cluster;

class Bullet extends Sprite {
  constructor(position, direction) {
    super(new Texture(bulletImageURL));
    this.speed = 1500;
    this.anchor = new Vector(-this.width / 2, -this.height / 2);
    this.scale = new Vector(direction, 1);
    this.position = position;
    this.direction = direction;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  update(dt, t) {
    const { position, speed, direction } = this;
    position.x += speed * dt * direction;
  }
}

export default Bullet;
