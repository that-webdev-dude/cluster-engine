// import { Container, Entity, System, Cmath, Vector } from "../cluster";
// import { Transform } from "../components/Transform";
// import { Velocity } from "../components/Velocity";
// // import { Input } from "../components/Input";
// import { Physics } from "../components/Physics";
// // import { InputMotion } from "../components/motion/InputMotion";
// // import { VibrationMotion } from "../components/motion/VibrationMotion";
// // import { KinematicMotion } from "../components/motion/KinematicMotion";

// // system dependencies
// const SystemComponents = {
//   Transform,
//   Velocity,
//   Physics, // optional
//   // Input,
//   // InputMotion,
//   // VibrationMotion,
//   // KinematicMotion,
// };

// // system errors
// enum SystemErrors {}

// // system cache
// let SystemCache = {
//   entities: new Container<Entity>(),
// };

// export class MovementSystem implements System {
//   private _move(entity: Entity, dt: number) {
//     const transform = entity.getComponent('Transform');
//     const velocity = entity.getComponent('Velocity');

//     if (transform && velocity) {
//       let accelerationX = 0;
//       let accelerationY = 0;

//       const physics = entity.getComponent('Physics');
//       if (physics) {
//         const { acceleration } = physics;
//         accelerationX = acceleration.x;
//         accelerationY = acceleration.y;
//         acceleration.set(0, 0);
//       }

//       const { position } = transform;
//       const { minSpeed, maxSpeed } = velocity;

//       let vx = velocity.value.x + accelerationX * dt;
//       let vy = velocity.value.y + accelerationY * dt;

//       if (maxSpeed) {
//         vx = Cmath.clamp(vx, -maxSpeed, maxSpeed);
//         vy = Cmath.clamp(vy, -maxSpeed, maxSpeed);
//       }

//       let dx = ((velocity.value.x + vx) / 2) * dt;
//       let dy = ((velocity.value.y + vy) / 2) * dt;
//       position.x += dx;
//       position.y += dy;

//       if (minSpeed) {
//         if (Math.abs(vx) < minSpeed) {
//           vx = 0;
//         }
//         if (Math.abs(vy) < minSpeed) {
//           vy = 0;
//         }
//       }

//       velocity.value.x = vx;
//       velocity.value.y = vy;
//     }
//   }

//   requiredComponents(): string[] {
//     return ["Transform", "Velocity"];
//   }

//   update(entities: Container<Entity>, dt: number): void {
//     if (!entities.size) return;

//     SystemCache.entities = entities.filter((entity) => {
//       return entity.hasComponents(
//         'Transform',
//         'Velocity'
//       );
//     });
//     if (!SystemCache.entities.size) return;

//     SystemCache.entities.forEach((entity) => {
//       this._move(entity, dt);
//     });

//     SystemCache.entities.clear();
//   }
// }
