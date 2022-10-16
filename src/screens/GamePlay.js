import cluster from "../cluster/index";
import math from "../cluster/utils/math";
const { Container, Capsule, Line, Text, Vector } = cluster;

class Cannon extends Capsule {
  constructor() {
    super({
      width: 10,
      height: 50,
      radius: 10,
    });
  }

  update(dt, t) {}
}

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.gameW = game.width;
    this.gameH = game.height;
    this.mouse = input.mouse;
    this.key = input.key;

    this.elapsed = 0;
    this.gameover = false;

    // cannon
    this.cannon = this.add(
      new Capsule({
        width: 10,
        height: 50,
        radius: 10,
      })
    );
    this.cannon.position = new Vector(this.gameW / 2, this.gameH + 5);
    this.cannon.anchor = new Vector(-5, -50);
    this.cannon.pivot = new Vector(5, 50);
    this.cannon.angle = 0;
    this.cannon.target = new Vector();

    // bullet
    this.bullet = this.add(
      new Capsule({
        width: 5,
        height: 10,
        radius: 5,
        style: {
          fill: "black",
        },
      })
    );
    this.bullet.pivot = new Vector(2.5, 10);
    this.bullet.angle = 0;
    this.bullet.speed = 1;
    this.bullet.dead = false;
    this.bullet.position = Vector.from(this.cannon.position);
    this.bullet.anchor = Vector.from(this.cannon.anchor);

    // DEBUG START
    // this.mouse.position.display(this, "red");
    // this.cannon.position.display(this, "blue");
    // this.cannon.target.display(this, "green", this.cannon.position);
    // DEBUG END
  }

  update(dt, t) {
    super.update(dt, t);
    let targetVector = this.cannon.position.to(this.mouse.position);
    let targetAngle = math.angle({ x: 1, y: 0 }, targetVector);

    this.cannon.angle = -targetAngle;
    this.bullet.angle = -targetAngle;

    if (this.mouse.isPressed) {
      // 'fire a bullet'
    }
    this.mouse.update();
  }
}

export default GamePlay;
