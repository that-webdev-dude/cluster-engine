import bulletImageURL from "../images/bullet.png";
import cluster from "../cluster";
import wallslide from "../cluster/movement/wallslide";
const { Rect, Sprite, Texture, Vector } = cluster;

class Bullet extends Sprite {
  constructor(level, position = new Vector(), direction = 1) {
    super(new Texture(bulletImageURL));

    this.level = level;
    this.scale = new Vector(1, 1);
    this.anchor = new Vector(0, 0);
    this.position = position;
    this.direction = direction;
    this.speed = 800;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };

    if (direction === 1) this.lookRight();
    if (direction === -1) this.lookLeft();
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

  lookRight() {
    const { scale, anchor } = this;
    scale.set(1, 1);
    anchor.set(0, 0);
    this.direction = 1;
  }

  lookLeft() {
    const { scale, anchor, width } = this;
    scale.set(-1, 1);
    anchor.set(width, 0);
    this.direction = -1;
  }

  update(dt, t) {
    const { level, direction, position, speed } = this;
    const { x: dx, y: dy } = new Vector(speed * dt * direction, 0);
    const r = wallslide(this, level, dx, dy);
    if (r.hits.left || r.hits.right) {
      this.dead = true;
    }
    if (position.x < -64 || position.x > level.width + 64) {
      this.dead = true;
    }
    position.add(r);
  }
}

export default Bullet;
