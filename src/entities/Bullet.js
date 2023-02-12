import bulletImageURL from "../images/bullet.png";
import cluster from "../cluster";
import Rect from "../cluster/shapes/Rect";

const { Sprite, Texture, Vector } = cluster;

class Bullet extends Sprite {
  constructor(position, direction) {
    super(new Texture(bulletImageURL));
    this.speed = 100;
    this.anchor = new Vector(0, 0);
    this.scale = new Vector(direction, 1);
    this.position = position;
    this.direction = direction;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };

    // const debugHitbox = new Rect({
    //   width: this.hitbox.width,
    //   height: this.hitbox.height,
    //   style: { fill: "red" },
    // });
    // debugHitbox.position = new Vector();
    // this.children = [debugHitbox];

    // const debugBounds = new Rect({
    //   width: this.bounds.width,
    //   height: this.bounds.height,
    //   style: { fill: "red" },
    // });
    // debugBounds.position = new Vector();
    // this.children = [debugBounds];
  }

  get bounds() {
    const { position, width, height } = this;
    return {
      x: 0,
      y: 0,
      // x: position.x,
      // y: position.y,
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
