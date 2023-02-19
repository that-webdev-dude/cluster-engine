import barrelImageURL from "../images/barrel.png";
import cluster from "../cluster";
const { Sprite, Texture, Vector } = cluster;

class Barrel extends Sprite {
  constructor(position = new Vector()) {
    super(new Texture(barrelImageURL));
    this.position = position;
    this.health = 5;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  get bounds() {
    const { position, width, height } = this;
    return {
      x: position.x,
      y: position.y,
      width,
      height,
    };
  }

  damage(amount) {
    this.health -= amount;
  }

  update(dt, t) {
    if (this.health === 0) this.dead = true;
  }
}

export default Barrel;
