import bulletImageURL from "../images/bullet.png";
import cluster from "../cluster";

const { Sprite, Texture, Vector } = cluster;

class Bullet extends Sprite {
  constructor(position, direction) {
    super(new Texture(bulletImageURL));
    this.speed = 1000;
    this.anchor = new Vector(-this.width / 2, -this.height / 2);
    this.position = position;
    this.direction = direction;
  }

  update(dt, t) {
    const { position, speed, direction } = this;
    position.x += speed * dt * direction;
  }
}

export default Bullet;
