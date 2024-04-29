import { Rect, Cmath, Timer } from "../cluster";

export class DustParticle extends Rect {
  timer: Timer;
  target: Rect;
  lifetime = 0.5;
  constructor(target: Rect) {
    super({
      width: 0,
      height: 0,
      style: {
        fill: "red",
        stroke: "transparent",
      },
    });
    this.target = target;
    this.timer = new Timer({
      duration: this.lifetime,
      onTick: (ratio: number) => {
        this.alpha = 1 - ratio;
      },
      onDone: () => {
        this.dead = true;
      },
    });

    this.reset();
  }

  reset() {
    let { target } = this;
    this.position.x = target.center.x;
    this.position.y = target.center.y + 12;
    this.velocity.x = Cmath.randf(-100, 100);
    this.velocity.y = Cmath.randf(-50, 10);
    this.height = Cmath.randf(2, 6);
    this.width = Cmath.randf(2, 6);
    this.alpha = 1;
    this.dead = false;
    this.timer.reset();
  }

  update(dt: number, t: number) {
    this.timer.update(dt);
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }
}
