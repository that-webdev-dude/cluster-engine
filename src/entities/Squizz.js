import squizzImageUrl from "../images/squizz.png";
import cluster from "../cluster";

const { Texture, TileSprite, math } = cluster;

class Squizz extends TileSprite {
  constructor(controller) {
    // setup
    const texture = new Texture(squizzImageUrl);

    // initialize
    super(texture, 32, 32);
    // this.anchor = { x: -16, y: -16 };
    this.dead = false;
    this.speed = 0.15;
    this.direction = { x: 1, y: 0 };
    this.controller = controller;
    this.animation.add(
      "roll",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      0.1
    );

    this.animation.play("roll");
  }

  update(dt, t) {
    super.update(dt);

    const { x: controllerX, y: controllerY } = this.controller;

    if (controllerX && controllerX !== this.direction.x) {
      // change to horizontal movement
      this.direction.x = controllerX;
      this.direction.y = 0;
      this.position.y = Math.round(this.position.y / 32) * 32;
    } else if (controllerY && controllerY !== this.direction.y) {
      // change to vertical movement
      this.direction.y = controllerY;
      this.direction.x = 0;
      this.position.x = Math.round(this.position.x / 32) * 32;
    }

    this.position.x += this.direction.x * dt * (32 / this.speed);
    this.position.y += this.direction.y * dt * (32 / this.speed);
  }
}

export default Squizz;
