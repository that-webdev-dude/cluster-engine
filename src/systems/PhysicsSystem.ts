// import {
//   Component,
//   Container,
//   Entity,
//   System,
//   Vector,
//   EntityGroup,
// } from "../cluster";
// import { Physics } from "../components/Physics";
// import { Input } from "../components/Input";

// // system dependencies
// const SystemComponents = {
//   Physics,
//   Input, // optional
// };

// // system cache
// class SystemCache {
//   static entities = new Container<Entity>();
//   static flatten = (
//     entities: Container<Entity>,
//     ...components: Component[]
//   ) => {
//     entities.forEach((entity) => {
//       if (entity.hasComponents(...components)) {
//         SystemCache.entities.add(entity);
//       }

//       if (entity instanceof EntityGroup) {
//         SystemCache.flatten(entity.entities, ...components);
//       }
//     });
//   };
// }

// export class PhysicsSystem implements System {
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
//     const physics = entity.getComponent(SystemComponents.Physics);
//     if (!physics) return;

//     const { generators } = physics;
//     generators.forEach((generator) => {
//       const { x, y } = generator(dt, t);
//       this._applyForce(physics.acceleration, physics.mass, x, y);
//     });
//   }

//   private _processEntities(
//     entities: Container<Entity>,
//     dt: number,
//     t: number
//   ): void {
//     entities.forEach((entity) => {
//       if (entity.hasComponent(SystemComponents.Physics)) {
//         this._applyForces(entity, dt, t);
//       }

//       if (entity instanceof EntityGroup) {
//         this._processEntities(entity.entities, dt, t);
//       }
//     });
//   }

//   requiredComponents(): string[] {
//     return ["Physics"];
//   }

//   public update(entities: Container<Entity>, dt: number, t: number): void {
//     if (!entities.size) return;

//     // SystemCache.flatten(entities, SystemComponents.Physics);

//     if (!SystemCache.entities.size) return;

//     SystemCache.entities.forEach((entity) => {
//       this._applyForces(entity, dt, t);
//     });

//     SystemCache.entities.clear();
//   }
// }
