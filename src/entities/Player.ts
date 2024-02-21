import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Keyboard, Physics, Cmath } from "../ares";
import PhysicsRect from "./PhysicsRect";

const ACCELERATION = 4000;
const FRICTION = 5;
const SPEED = 700;

class Player extends PhysicsRect {
  keyboard: Keyboard;
  constructor(keyboard: Keyboard) {
    super({
      physicsType: 1, // dynamic
      position: new Vector(100, 100),
      height: 10,
      width: 10,
      fill: "black",
      mass: 0,
    });

    this.keyboard = keyboard;
  }

  update(dt: number, t: number): void {
    const { keyboard } = this;
    if (Math.abs(this.velocity.x) < SPEED) {
      Physics.applyForce(this, {
        x: keyboard.x * ACCELERATION,
        y: keyboard.y * ACCELERATION,
      });
    }
    Physics.applyFriction(this, FRICTION); // game engine responsability?
    if (keyboard.action) {
      Physics.applyImpulse(this, { x: 0, y: -1000 }, dt);
      keyboard.active = false;
    }
    // Physics.updateEntity(this, dt);

    if (this.acceleration.magnitude < 0.1) {
      this.acceleration.set(0, 0);
    }
    if (this.velocity.magnitude < 0.1) {
      this.velocity.set(0, 0);
    }
    if (
      this.position.x <= 0 ||
      this.position.x >= GAME_CONFIG.width - this.width
    ) {
      this.velocity.x = 0;
      this.position.x = Cmath.clamp(
        this.position.x,
        0,
        GAME_CONFIG.width - this.width
      );
    }
    if (
      this.position.y <= 0 ||
      this.position.y >= GAME_CONFIG.height - this.height
    ) {
      this.velocity.y = 0;
      this.position.y = Cmath.clamp(
        this.position.y,
        0,
        GAME_CONFIG.height - this.height
      );
    }
  }
}

export default Player;

// import { GAME_CONFIG } from "../config/GameConfig";
// import {
//   Cmath,
//   Rect,
//   State,
//   Vector,
//   Physics,
//   Keyboard,
//   Gamepad,
// } from "../ares";

// enum STATES {
//   standing,
//   walking,
//   jumping,
//   falling,
// }

// const MAX_SPEED = 700;
// const MIN_SPEED = 20;
// const ACCELERATION = 4000;
// const FRICTION = 5;

// class Player extends Rect {
//   state: State<STATES> = new State(STATES.standing);
//   velocity: Vector = new Vector(0, 0);
//   acceleration: Vector = new Vector(0, 0);
//   keyboard: Keyboard;
//   gamepad: Gamepad;

//   constructor(keyboard: Keyboard, gamepad: Gamepad) {
//     super({
//       width: 32,
//       height: 32,
//       fill: "grey",
//       position: new Vector(100, 300),
//     });

//     this.keyboard = keyboard;
//     this.gamepad = gamepad;
//     console.log(this);
//   }

//   update(dt: number, t: number): void {
//     const { state, velocity, position, width, height, keyboard } = this;

//     switch (state.get()) {
//       case STATES.standing:
//         if (keyboard.x) state.set(STATES.walking);
//         if (keyboard.action) state.set(STATES.jumping);
//         console.log("standing");
//         break;

//       case STATES.walking:
//         Physics.applyForce(this, {
//           x: keyboard.x * ACCELERATION,
//           y: 0,
//         })
//           .applyFriction(this, FRICTION)
//           .updateEntity(this, dt);
//         if (velocity.magnitude <= MIN_SPEED) {
//           state.set(STATES.standing);
//         }
//         console.log("walking");
//         break;

//       case STATES.jumping:
//         if (state.first) {
//           Physics.applyImpulse(this, { x: 0, y: -1000 }, dt);
//         }
//         if (velocity.y === 0) {
//           state.set(STATES.falling);
//         }
//         Physics.applyGravity(this, 9800 / 2).updateEntity(this, dt);

//         // console.log("jumping");
//         break;

//       case STATES.falling:
//         Physics.applyGravity(this, 9800 / 2).updateEntity(this, dt);
//         if (velocity.magnitude <= 100) {
//           state.set(STATES.standing);
//         }
//         // if (velocity.y === 0) {
//         //   state.set(STATES.standing);
//         // }
//         console.log("falling");
//         break;
//     }

//     if (position.x <= 0 || position.x >= GAME_CONFIG.width - width) {
//       velocity.x = 0;
//       position.x = Cmath.clamp(position.x, 0, GAME_CONFIG.width - width);
//     }
//     if (position.y <= 0 || position.y >= GAME_CONFIG.height - height) {
//       velocity.y = 0;
//       position.y = Cmath.clamp(position.y, 0, GAME_CONFIG.height - height);
//     }
//     if (Math.abs(velocity.x) > MAX_SPEED) {
//       velocity.x = Cmath.clamp(velocity.x, -MAX_SPEED, MAX_SPEED);
//     }
//     // if (Math.abs(velocity.magnitude) < MIN_SPEED) {
//     //   velocity.set(0, 0);
//     //   state.set(STATES.standing);
//     // }
//   }
// }

// export default Player;
