// import charactersImageURL from "../images/characters.png";
// import wallslide from "../cluster/movement/wallslide";
// import cluster from "../cluster/index";
// import Weapon from "./Weapon";
// // prettier-ignore
// const {
//   TileSprite,
//   Texture,
//   Physics,
//   Vector,
//   State,
//   Rect,
//   math,
// } = cluster;

// const states = {
//   SLEEPING: 1,
//   WALKING: 2,
//   JUMPING: 3,
//   FALLING: 4,
// };

// const world = {
//   FRICTION: 1250, // ACC/2
//   GRAVITY: 2800,
// };

// const attributes = {
//   ACCELERATION: 2500,
//   MIN_VELOCITY: 10,
//   MAX_VELOCITY: 400, // ACC/6
//   JUMP_FORGIVENESS: 0.04,
// };

// class Player extends TileSprite {
//   constructor(input, level) {
//     const width = 32;
//     const height = 32;
//     super(new Texture(charactersImageURL), width, height);
//     this.state = new State(states.FALLING);
//     this.input = input;
//     this.level = level;
//     this.animation.add(
//       "idle",
//       [
//         { x: 1, y: 1 },
//         { x: 2, y: 1 },
//       ],
//       0.25
//     );
//     this.animation.add(
//       "walk",
//       [
//         { x: 0, y: 0 },
//         { x: 1, y: 0 },
//         { x: 2, y: 0 },
//         { x: 0, y: 1 },
//         { x: 1, y: 1 },
//       ],
//       0.05
//     );

//     this.scale = new Vector(1, 1);
//     this.anchor = new Vector(0, 0);
//     // ...
//     // invincibility blinking
//     this.invincibility = 0;
//     this.isInvincible = false;
//     // ...
//     // jump forgiveness
//     this.fallingTimer = 0;
//     // ...
//     this.direction = 1;
//     this.position = new Vector(32 * 8, 224);
//     this.velocity = new Vector();
//     this.acceleration = new Vector();
//     this.hitbox = {
//       x: 0,
//       y: 0,
//       width,
//       height,
//     };

//     this.weapon = new Weapon(level, new Vector(8, 14));
//     this.children = [this.weapon];

//     // DEBUG
//     // const debugHitbox = new Rect({
//     //   width: this.hitbox.width,
//     //   height: this.hitbox.height,
//     //   style: { stroke: "red", fill: "transparent" },
//     // });
//     // debugHitbox.position = new Vector(this.hitbox.x, this.hitbox.y);
//     // this.children = [debugHitbox];
//     // END DEBUG

//     this.firstUpdate = true;
//     this.alpha = 1;
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

//   lookRight() {
//     const { scale, anchor } = this;
//     scale.set(1, 1);
//     anchor.set(0, 0);
//     this.direction = 1;
//   }

//   lookLeft() {
//     const { scale, anchor, width } = this;
//     scale.set(-1, 1);
//     anchor.set(width, 0);
//     this.direction = -1;
//   }

//   walk() {
//     const { velocity, direction } = this;
//     if (Math.abs(velocity.x) < attributes.MAX_VELOCITY) {
//       Physics.World.applyForce(this, { x: direction * attributes.ACCELERATION, y: 0 });
//     }
//   }

//   jump(dt) {
//     Physics.World.applyImpulse(this, { x: 0, y: -1000 }, dt);
//   }

//   fire(dt) {
//     const { position, direction, weapon } = this;
//     return weapon.fire(dt, position, direction);
//   }

//   knockback(dt, entity) {
//     const { velocity, acceleration } = this;
//     const power = 400;
//     const impulse = entity.position.to(this.position).unit().multiply(power);
//     velocity.set(0, 0);
//     acceleration.set(0, 0);
//     Physics.World.applyImpulse(this, impulse, dt);
//   }

//   invincible(duration = 1) {
//     this.invincibility = duration;
//     this.isInvincible = true;
//   }

//   update(dt, t) {
//     super.update(dt, t);
//     // prettier-ignore
//     const {
//       state,
//       input,
//       level,
//       velocity,
//       position,
//     } = this;

//     // invincibility blinking
//     if ((this.invincibility -= dt) > 0) {
//       this.alpha = Math.floor((t / 0.05) % 2);
//     } else {
//       this.alpha = 1;
//       this.isInvincible = false;
//     }

//     // apply word forces
//     Physics.World.applyFriction(this, world.FRICTION);
//     Physics.World.applyGravity(this, world.GRAVITY);

//     if (input.key.x === 1) this.lookRight();
//     if (input.key.x === -1) this.lookLeft();

//     // set the state
//     switch (state.get()) {
//       case states.SLEEPING:
//         // init
//         if (state.first) {
//           this.animation.play("idle");
//         }
//         // → transition walking
//         if (input.key.x !== 0) {
//           state.set(states.WALKING);
//         }
//         // → transition jumping
//         if (input.key.y === -1) {
//           state.set(states.JUMPING);
//         }
//         break;

//       case states.JUMPING:
//         // init
//         if (state.first) {
//           this.jump(dt);
//           this.animation.play("walk");
//         }
//         // action
//         if (input.key.x !== 0) {
//           this.walk(input.key.x);
//         }
//         // → transition falling
//         if (velocity.y > 0) {
//           state.set(states.FALLING);
//         }
//         break;

//       case states.WALKING:
//         // init
//         if (state.first) {
//           this.animation.play("walk");
//         }
//         // action
//         if (input.key.x !== 0) {
//           this.walk(input.key.x);
//         }
//         // → transition jumping
//         if (input.key.y === -1) {
//           state.set(states.JUMPING);
//         }
//         // → transition falling
//         if (velocity.y > 50) {
//           // jump forgiveness
//           if (this.fallingTimer <= 0) {
//             this.fallingTimer = attributes.JUMP_FORGIVENESS;
//           } else {
//             if ((this.fallingTimer -= dt) <= 0) {
//               state.set(states.FALLING);
//             }
//           }
//         }
//         // → transition sleeping
//         if (!input.key.x && velocity.x === 0) {
//           state.set(states.SLEEPING);
//         }
//         break;

//       case states.FALLING:
//         // init
//         if (state.first) {
//           this.animation.play("walk");
//         }
//         // action
//         if (input.key.x !== 0) {
//           this.walk(input.key.x);
//         }
//         // → transition sleeping
//         if (velocity.y === 0) {
//           state.set(states.SLEEPING);
//         }
//         break;

//       default:
//         console.warn("Player needs another state?");
//         break;
//     }

//     // console.log(state.get());

//     // update position
//     const { x: dx, y: dy } = Physics.World.getDisplacement(this, dt);
//     const r = wallslide(this, level, dx, dy);
//     if (r.hits.down || r.hits.up) {
//       this.fallingTimer = 0;
//       velocity.set(velocity.x, 0);
//     }
//     if (r.hits.left || r.hits.right) {
//       velocity.set(0, velocity.y);
//     }
//     if (this.velocity.magnitude <= attributes.MIN_VELOCITY) {
//       velocity.set(0, 0);
//     }
//     position.add(r);

//     state.update(dt, t);

//     // FIRST UPDATE ONLY
//     if (this.firstUpdate) {
//       this.firstUpdate = false;
//     }
//   }
// }

// export default Player;
