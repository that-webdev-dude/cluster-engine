import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Cmath } from "../../tools/Cmath";
import { Components } from "../index";

export class PhysicsSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

  private _integrate(entity: Entity, dt: number) {
    const transformComponent = entity.getComponent(Components.Transform);
    const velocityComponent = entity.getComponent(Components.Velocity);

    if (transformComponent && velocityComponent) {
      let accelerationX = 0;
      let accelerationY = 0;
      let physicsComponent = entity.getComponent(Components.Physics);
      if (physicsComponent) {
        const { acceleration } = physicsComponent;
        accelerationX = acceleration.x;
        accelerationY = acceleration.y;
        acceleration.set(0, 0);
        // here you need to apply any additional forces like gravity or friction and add them to accelerationX and accelerationY respectively
      }

      const { position } = transformComponent;
      const { velocity, maxSpeed, minSpeed } = velocityComponent;

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

  private _processEntities(entities: Container<Entity>, dt: number) {
    entities.forEach((entity) => {
      this._integrate(entity, dt);
    });
  }

  public update(dt: number): void {
    const entities = this._entities.filter((entity) =>
      entity.hasComponents(Components.Transform, Components.Velocity)
    );

    if (entities.size) {
      this._processEntities(entities, dt);
    }
  }
}
