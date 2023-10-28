import enemyImageURL from "../images/enemy.png";
import cluster from "../cluster";

const { Sprite, Texture, math } = cluster;

class Enemy extends Sprite {
  constructor() {
    super(new Texture(enemyImageURL));
    this.speed = null;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };

    this.reset();
  }

  reset() {
    this.speed = math.rand(50, 200);
  }

  update(dt, t) {
    this.position.x -= this.speed * dt;
  }
}

export default Enemy;
