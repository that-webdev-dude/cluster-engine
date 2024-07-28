// import { Container, Entity, System, Cmath, Vector, Keyboard } from "../cluster";
// import { Physics } from "../components/Physics";
// import { Input } from "../components/Input";

// // system dependencies
// const SystemComponents = {
//   Physics,
//   Input, // optional
// };

// // system errors
// enum SystemErrors {}

// // system cache
// let SystemCache = {
//   entities: new Container<Entity>(),
// };

// export class PhysicsSystem extends System {
//   private _applyForce(
//     acceleration: Vector,
//     mass: number,
//     forceX: number,
//     forceY: number
//   ): void {
//     acceleration.x += forceX / mass;
//     acceleration.y += forceY / mass;
//   }

//   private _applyForces(entity: Entity, dt: number, t: number): void {
//     const input = entity.getComponent(SystemComponents.Input);
//     const physics = entity.getComponent(SystemComponents.Physics);
//     if (!physics) return;

//     const { generators } = physics;
//     generators.forEach((generator) => {
//       const { x, y } = generator(dt, t);
//       this._applyForce(physics.acceleration, physics.mass, x, y);
//     });

//     // const { forces } = physics;
//     // const { acceleration, mass } = physics;
//     // forces.forEach((entityForce) => {
//     //   const { inputKey, force } = entityForce;
//     //   let { x, y } = force;
//     //   if (inputKey) {
//     //     if (!input) return;
//     //     x *= input[inputKey];
//     //     y *= input[inputKey];
//     //   }
//     //   this._applyForce(acceleration, mass, x, y);
//     // });

//     // const { impulses } = physics;
//     // impulses.forEach((entityImpulse) => {
//     //   const { inputKey, force } = entityImpulse;
//     //   let { x, y } = force;
//     //   if (inputKey) {
//     //     if (!input) return;
//     //     x *= input[inputKey];
//     //     y *= input[inputKey];
//     //   }
//     //   this._applyForce(acceleration, mass, x / dt, y / dt);
//     // });
//   }

//   public update(entities: Container<Entity>, dt: number, t: number): void {
//     if (!entities.size) return;

//     SystemCache.entities = entities.filter((entity) => {
//       return entity.hasComponents(SystemComponents.Physics);
//     });
//     if (!SystemCache.entities.size) return;

//     SystemCache.entities.forEach((entity) => {
//       this._applyForces(entity, dt, t);
//       // apply friction
//     });

//     SystemCache.entities.clear();
//   }
// }
