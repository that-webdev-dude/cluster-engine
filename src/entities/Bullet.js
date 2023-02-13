import bulletImageURL from "../images/bullet.png";
import cluster from "../cluster";
const { Rect, Sprite, Texture, Vector } = cluster;

class Bullet extends Sprite {
  constructor(position, direction = 1) {
    super(new Texture(bulletImageURL));

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
    const { direction, position, speed } = this;
    const displacement = new Vector(speed * dt * direction, 0);
    position.add(displacement);
  }
}

// class Bullet extends Rect {
//   constructor(position, direction = 1) {
//     const fill = "red";
//     const width = 16;
//     const height = 8;
//     super({
//       width: width,
//       height: height,
//       style: { fill: fill },
//     });

//     this.scale = new Vector(1, 1);
//     this.anchor = new Vector(0, 0);
//     this.position = position;
//     this.direction = direction;
//     this.speed = 800;
//     this.hitbox = {
//       x: 0,
//       y: 0,
//       width,
//       height,
//     };
//   }

//   get bounds() {
//     const { position, width, height } = this;
//     return {
//       x: position.x,
//       y: position.y,
//       width,
//       height,
//     };
//   }

//   update(dt, t) {
//     const { direction, position, speed } = this;
//     const displacement = new Vector(speed * dt * direction, 0);
//     position.add(displacement);
//   }
// }

export default Bullet;
