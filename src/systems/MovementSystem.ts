import { Container, Entity, System, Cmath } from "../cluster";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Input } from "../components/Input";
import { InputMotion } from "../components/motion/InputMotion";
import { VibrationMotion } from "../components/motion/VibrationMotion";

// system dependencies
const SystemComponents = {
  Transform,
  Velocity,
  Input,
  InputMotion,
  VibrationMotion,
};

// system errors
enum SystemErrors {}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

/**
 * MovementSystem
 * @components Transform, Velocity, Input, InputMotion, VibrationMotion
 */
export class MovementSystem extends System {
  private _move(entity: Entity, dt: number) {
    const transform = entity.getComponent(SystemComponents.Transform);
    const velocity = entity.getComponent(SystemComponents.Velocity);

    if (transform && velocity) {
      let accelerationX = 0;
      let accelerationY = 0;

      // const physicsComponent = entity.getComponent(Components.Physics);
      // if (physicsComponent) {
      //   const { acceleration } = physicsComponent;
      //   accelerationX = acceleration.x;
      //   accelerationY = acceleration.y;
      //   acceleration.set(0, 0);
      // }

      const { previousPosition, position } = transform;
      const { minSpeed, maxSpeed } = velocity;

      let vx = velocity.value.x + accelerationX * dt;
      let vy = velocity.value.y + accelerationY * dt;

      if (maxSpeed) {
        vx = Cmath.clamp(vx, -maxSpeed, maxSpeed);
        vy = Cmath.clamp(vy, -maxSpeed, maxSpeed);
      }

      let dx = ((velocity.value.x + vx) / 2) * dt;
      let dy = ((velocity.value.y + vy) / 2) * dt;

      // previousPosition.x = position.x;
      // previousPosition.y = position.y;
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

  update(entities: Container<Entity>, dt: number): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) => {
      return entity.hasComponent(SystemComponents.Transform);
    });
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      const input = entity.getComponent(SystemComponents.Input);
      const inputMotion = entity.getComponent(SystemComponents.InputMotion);
      if (input && inputMotion) {
        const { speedX, speedY } = inputMotion;
        const { x, y } = input;

        const velocity = entity.getComponent(SystemComponents.Velocity);
        if (velocity) {
          velocity.value.x = x * speedX;
          velocity.value.y = y * speedY;
        }
        this._move(entity, dt);
      }

      const vibrationMotion = entity.getComponent(
        SystemComponents.VibrationMotion
      );

      if (vibrationMotion) {
        const { offsetX, offsetY } = vibrationMotion;
        const transform = entity.getComponent(SystemComponents.Transform);
        if (transform) {
          const { previousPosition, position } = transform;
          // previousPosition.x = position.x;
          // previousPosition.y = position.y;
          position.x += Cmath.randf(-offsetX, offsetX);
          position.y += Cmath.randf(-offsetY, offsetY);
        }
      }
    });

    SystemCache.entities.clear();
  }
}
