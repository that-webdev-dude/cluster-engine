import cluster from "../cluster";
import barrelImageURL from "../images/barrel.png";
// prettier-ignore
const { 
  Texture, 
  Sprite, 
  Vector 
} = cluster;

const texture = new Texture(barrelImageURL);

class Barrel extends Sprite {
  constructor(position = new Vector()) {
    super(texture);
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
}

export default Barrel;
