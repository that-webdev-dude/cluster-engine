import Container from "../core/Container";
import Vector from "../utils/Vector";
import math from "../utils/math";
import Circle from "../shapes/Circle";

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

// ------------------------------------------------------------------------------
// const DEFAULT = {
//   alpha: 1,
//   gravity: true,
//   renderable: new Circle({ radius: 5, style: { fill: "black" } }),
//   lifeSpan: 0.5,
//   positionSetter: () => {
//     return new Vector(0, 0);
//   },
//   velocitySetter: () => {
//     return new Vector(math.randf(-1.5, 1.5), math.randf(-15, -2.5));
//   },
// };

// class Particle extends Container {
//   #userParams;
//   #positionSetter;
//   #velocitySetter;

//   constructor(config = { ...DEFAULT }) {
//     super();
//     const { renderable, positionSetter, velocitySetter, ...userParams } = config;
//     this.#userParams = userParams;
//     this.#positionSetter = positionSetter;
//     this.#velocitySetter = velocitySetter;
//     this.firstUpdate = true;
//     this.dead = false;
//     this.add(renderable);
//   }

//   #initialize() {
//     const { lifeSpan: timer } = this.#userParams;
//     this.velocity = this.#velocitySetter();
//     this.position = this.#positionSetter();
//     this.timer = timer;
//     Object.assign(this, this.#userParams);
//   }

//   reset() {
//     this.#initialize();
//   }

//   update(dt, t) {
//     if (this.dead) return;
//     this.timer -= dt;
//     this.alpha = this.timer / this.lifeSpan;
//     if (this.gravity) {
//       this.velocity.add({ x: 0, y: this.gravity });
//     }
//     this.position.add(this.velocity);
//     if (this.timer <= 0) {
//       this.dead = true;
//       return;
//     }

//     // FIRST UPDATE ONLY
//     if (this.firstUpdate) {
//       this.firstUpdate = false;
//     }
//   }
// }

// ------------------------------------------------------------------------------
// class Particle extends Container {
//   constructor(
//     lifeSpan = DEFAULT.lifeSpan,
//     renderable = DEFAULT.renderable,
//     speedSetter = DEFAULT.speedSetter,
//     gravity = DEFAULT.gravity,
//     alpha = DEFAULT.alpha
//   ) {
//     super();
//     this.params = { lifeSpan, renderable, speedSetter, gravity, alpha, ...DEFAULT };
//     this.renderable = this.add(renderable);
//     this.velocity = speedSetter;
//     this.position = new Vector(0, 0);
//     this.gravity = gravity;

//     this.lifeSpan = lifeSpan;
//     this.timer = lifeSpan;
//     this.alpha = alpha;
//     this.dead = true;

//   }

//   reset() {
//     this.velocity = new Vector(math.randf(-1.5, 1.5), math.randf(-7.5, -2.5));
//     this.position = new Vector(0, 0);
//     this.timer = this.lifeSpan;
//     this.alpha = 1;
//     this.dead = false;
//   }

//   update(dt, t) {
//     if (this.dead) return;
//     this.timer -= dt;
//     this.alpha = this.timer / this.lifeSpan;
//     if (this.gravity) {
//       this.velocity.add({ x: 0, y: this.gravity });
//     }
//     this.position.add(this.velocity);
//     if (this.timer <= 0) {
//       this.dead = true;
//       return;
//     }
//   }
// }

export default Particle;
