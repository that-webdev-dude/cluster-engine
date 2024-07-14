import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Vector } from "../../tools/Vector";
import { Cmath } from "../../tools/Cmath";
import { Components } from "../index";

// cache the entities that have a physics component
let systemEntities: Container<Entity>;

export class PhysicsSystem extends System {
  private _accumulate(entity: Entity, dt: number) {
    const physics = entity.getComponent(Components.Physics);
    if (physics) {
      const { acceleration, friction, mass, forces, impulses } = physics;
      if (forces) {
        forces.forEach((force) => {
          const userForce = force();
          acceleration.x += userForce.x / mass;
          acceleration.y += userForce.y / mass;
        });
      }
    }
  }

  private _integrate(entity: Entity, dt: number) {
    const transformComponent = entity.getComponent(Components.Transform);
    const velocityComponent = entity.getComponent(Components.Velocity);

    if (transformComponent && velocityComponent) {
      let accelerationX = 0;
      let accelerationY = 0;

      const physicsComponent = entity.getComponent(Components.Physics);
      if (physicsComponent) {
        const { acceleration } = physicsComponent;
        accelerationX = acceleration.x;
        accelerationY = acceleration.y;
        acceleration.set(0, 0);
      }

      const { position } = transformComponent;
      const { velocity, minSpeed, maxSpeed } = velocityComponent;

      let vx = velocity.x + accelerationX * dt;
      let vy = velocity.y + accelerationY * dt;

      if (maxSpeed) {
        vx = Cmath.clamp(vx, -maxSpeed, maxSpeed);
        vy = Cmath.clamp(vy, -maxSpeed, maxSpeed);
      }

      let dx = ((velocity.x + vx) / 2) * dt;
      let dy = ((velocity.y + vy) / 2) * dt;

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

      velocity.x = vx;
      velocity.y = vy;
    }
  }

  public update(entities: Container<Entity>, dt: number): void {
    if (!entities.size) return;

    systemEntities = entities.filter((entity) =>
      entity.hasComponent(Components.Physics)
    );
    if (!systemEntities.size) return;

    systemEntities.forEach((entity) => {
      this._accumulate(entity, dt);
      this._integrate(entity, dt);
    });

    systemEntities.clear();
  }
}
