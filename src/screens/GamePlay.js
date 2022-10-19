import cluster from "../cluster/index";
import math from "../cluster/utils/math";
const { Container, Capsule, Line, Text, Vector, Physics } = cluster;

import Bullet from "../entities/Bullet";
import Cannon from "../entities/Cannon";

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.gameover = false;
    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.gameW = game.width;
    this.gameH = game.height;
    this.mouse = input.mouse;
    this.key = input.key;

    // entities
    this.bullets = new Container();
    this.cannon = new Cannon(new Vector(this.gameW / 2, this.gameH + 5));

    // scene
    this.add(this.bullets);
    this.add(this.cannon);

    // DEBUG START
    // ...
    // DEBUG END
  }

  fireBullet(impulse, dt) {
    const { position, angle } = this.cannon;
    const bullet = new Bullet(Vector.from(position), angle);
    Physics.applyImpulse(bullet, Vector.from(impulse).unit().scale(800), dt);
    this.bullets.add(bullet);
  }

  update(dt, t) {
    super.update(dt, t);
    let targetVector = this.cannon.position.to(this.mouse.position);
    let targetAngle = math.angle({ x: 1, y: 0 }, targetVector);
    this.cannon.angle = -targetAngle;

    if (this.mouse.isPressed) {
      this.fireBullet(targetVector, dt);
    }

    if (this.bullets.children.length) {
      const { children } = this.bullets;
      children.forEach((b) => {
        const { x, y } = b.position;
        const offset = 200;
        if (x < -offset || x > this.gameW + offset || y < -offset || y > this.gameH + offset) {
          b.dead = true;
        }
      });
    }

    this.mouse.update();
  }
}

export default GamePlay;
