import { Container, Entity, System, Cmath, Vector } from "../cluster";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
// import { Input } from "../components/Input";
import { Physics } from "../components/Physics";
// import { InputMotion } from "../components/motion/InputMotion";
// import { VibrationMotion } from "../components/motion/VibrationMotion";
// import { KinematicMotion } from "../components/motion/KinematicMotion";

// system dependencies
const SystemComponents = {
  Transform,
  Velocity,
  Physics, // optional
  // Input,
  // InputMotion,
  // VibrationMotion,
  // KinematicMotion,
};

// system errors
enum SystemErrors {}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

export class MovementSystem extends System {
  private _move(entity: Entity, dt: number) {
    const transform = entity.getComponent(SystemComponents.Transform);
    const velocity = entity.getComponent(SystemComponents.Velocity);

    if (transform && velocity) {
      let accelerationX = 0;
      let accelerationY = 0;

      const physics = entity.getComponent(SystemComponents.Physics);
      if (physics) {
        const { acceleration } = physics;
        accelerationX = acceleration.x;
        accelerationY = acceleration.y;
        acceleration.set(0, 0);
      }

      const { position } = transform;
      const { minSpeed, maxSpeed } = velocity;

      let vx = velocity.value.x + accelerationX * dt;
      let vy = velocity.value.y + accelerationY * dt;

      if (maxSpeed) {
        vx = Cmath.clamp(vx, -maxSpeed, maxSpeed);
        vy = Cmath.clamp(vy, -maxSpeed, maxSpeed);
      }

      let dx = ((velocity.value.x + vx) / 2) * dt;
      let dy = ((velocity.value.y + vy) / 2) * dt;
      position.x += dx;
      position.y += dy;

      if (minSpeed) {
        if (Math.abs(vx) < minSpeed) {
          vx = 0;
        }
        if (Math.abs(vy) < minSpeed) {
          vy = 0;
        }
      }

      velocity.value.x = vx;
      velocity.value.y = vy;
    }
  }

  // private _updateKinematic(entity: Entity, dt: number) {
  //   const kinematicMotion = entity.getComponent(
  //     SystemComponents.KinematicMotion
  //   );
  //   if (!kinematicMotion) return;

  //   // the input should be more flexible
  //   // let x = 1;
  //   // let y = 1;
  //   // const { input } = kinematicMotion;
  //   // if (input) {
  //   //   const entityInput = entity.getComponent(SystemComponents.Input);
  //   //   if (!entityInput) return;
  //   //   x = entityInput.x;
  //   //   y = entityInput.y;
  //   // }

  //   const velocity = entity.getComponent(SystemComponents.Velocity);
  //   if (!velocity) return;

  //   const { path } = kinematicMotion;
  //   if (path.length < 2) return;

  //   let { targetPosition, startPosition, pathVelocity } = kinematicMotion;
  //   pathVelocity = Vector.subtract(targetPosition, startPosition)
  //     .normalize()
  //     .scale(kinematicMotion.speed);

  //   velocity.value.x = pathVelocity.x;
  //   velocity.value.y = pathVelocity.y;

  //   const transform = entity.getComponent(SystemComponents.Transform);
  //   if (!transform) return;

  //   const { position } = transform;
  //   const travelDistance = Vector.subtract(
  //     targetPosition,
  //     startPosition
  //   ).magnitude;
  //   const pathDistance = Vector.subtract(position, startPosition).magnitude;
  //   if (position.equals(targetPosition)) {
  //     console.log("reached target position");
  //     // const nextIndex = path.indexOf(targetPosition) + 1;
  //     // if (nextIndex >= path.length) {
  //     //   targetPosition = path[0];
  //     // } else {
  //     //   targetPosition = path[nextIndex];
  //     // }
  //   }

  //   this._move(entity, dt);
  // }

  update(entities: Container<Entity>, dt: number): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) => {
      return entity.hasComponents(
        SystemComponents.Transform,
        SystemComponents.Velocity
      );
    });
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      this._move(entity, dt);
      // const input = entity.getComponent(SystemComponents.Input);
      // const inputMotion = entity.getComponent(SystemComponents.InputMotion);
      // if (input && inputMotion) {
      //   const { speedX, speedY } = inputMotion;
      //   const { x, y } = input;
      //   const velocity = entity.getComponent(SystemComponents.Velocity);
      //   if (velocity) {
      //     velocity.value.x = x * speedX;
      //     velocity.value.y = y * speedY;
      //   }
      //   this._move(entity, dt);
      // }
      // const kinematicMotion = entity.getComponent(
      //   SystemComponents.KinematicMotion
      // );
      // if (kinematicMotion) {
      //   this._updateKinematic(entity, dt);
      // }
      // const vibrationMotion = entity.getComponent(
      //   SystemComponents.VibrationMotion
      // );
      // if (vibrationMotion) {
      //   const { offsetX, offsetY } = vibrationMotion;
      //   const transform = entity.getComponent(SystemComponents.Transform);
      //   if (transform) {
      //     const { previousPosition, position } = transform;
      //     // previousPosition.x = position.x;
      //     // previousPosition.y = position.y;
      //     position.x += Cmath.randf(-offsetX, offsetX);
      //     position.y += Cmath.randf(-offsetY, offsetY);
      //   }
      // }
    });

    SystemCache.entities.clear();
  }
}
