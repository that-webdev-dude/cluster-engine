import Container from "../core/Container";
import Vector from "../utils/Vector";

class Particle extends Container {
  constructor(config) {
    super();
    const { alpha, lifeSpan, velocity, gravity, renderable } = config;
    this.dead = false;
    this.alpha = alpha;
    this.timer = lifeSpan;
    this.gravity = gravity;
    this.velocity = velocity;
    this.lifeSpan = lifeSpan;
    this.renderable = this.add(renderable);
    this.userAlpha = alpha;
  }

  reset() {
    const { lifeSpan, userAlpha } = this;
    this.dead = false;
    this.timer = lifeSpan;
    this.alpha = userAlpha;
    this.position = new Vector();
  }

  update(dt, t) {
    if (this.dead) return;
    this.timer -= dt;
    this.alpha = this.timer / this.lifeSpan;
    if (this.gravity) {
      this.velocity.add({ x: 0, y: this.gravity });
    }

    this.position.add(this.velocity);
    if (this.timer <= 0) {
      this.dead = true;
      return;
    }

    // FIRST UPDATE ONLY
    if (this.firstUpdate) {
      this.firstUpdate = false;
    }
  }
}

export default Particle;
