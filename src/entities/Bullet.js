import bulletImageURL from "../images/bullet.png";
import cluster from "../cluster";
import Rect from "../cluster/shapes/Rect";

const { Sprite, Texture, Vector } = cluster;

class Bullet extends Sprite {
  constructor(position, direction) {
    super(new Texture(bulletImageURL));
    this.speed = 1500;
    // this.anchor = new Vector(-this.width / 2, 0);
    this.scale = new Vector(direction, 1);
    this.position = position;
    this.direction = direction;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width / 2,
      height: this.height / 2,
    };

    // const debugHitbox = new Rect({
    //   width: this.hitbox.width,
    //   height: this.hitbox.height,
    //   style: { fill: "red" },
    // });
    // debugHitbox.position = new Vector();
    // this.children = [debugHitbox];
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

  update(dt, t) {
    const { position, speed, direction } = this;
    position.x += speed * dt * direction;
  }
}

export default Bullet;
