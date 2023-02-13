import cluster from "../cluster";
const { Rect, Vector } = cluster;

class Bullet extends Rect {
  constructor(position, direction = 1) {
    const fill = "red";
    const width = 16;
    const height = 8;
    super({
      width: width,
      height: height,
      style: { fill: fill },
    });

    this.scale = new Vector(1, 1);
    this.anchor = new Vector(0, 0);
    this.position = position;
    this.direction = direction;
    this.speed = 800;
    this.hitbox = {
      x: 0,
      y: 0,
      width,
      height,
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

  update(dt, t) {
    const { direction, position, speed } = this;
    const displacement = new Vector(speed * dt * direction, 0);
    position.add(displacement);
  }
}

export default Bullet;
