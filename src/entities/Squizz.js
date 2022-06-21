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
    this.speed = 150;
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

    const { position, controller, speed } = this;

    position.x += controller.x * speed * dt;
    position.y += controller.y * speed * dt;
  }
}

export default Squizz;
