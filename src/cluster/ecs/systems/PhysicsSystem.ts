import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";

export class PhysicsSystem extends System {
  private _move(
    entity: Entity,
    dt: number,
    inputX: number = 1,
    inputY: number = 1
  ) {
    const transform = entity.getComponent(Components.Transform);
    const speed = entity.getComponent(Components.Speed);
    if (transform && speed) {
      const { position } = transform;
      position.x += inputX * speed.value * dt;
      position.y += inputY * speed.value * dt;
    }
  }

  update(entities: Container<Entity>, dt: number): void {
    // entities.forEach((entity: Entity) => {
    //   const input = entity.getComponent(Components.Input);
    //   if (input) {
    //     this._move(entity, dt, input.x, input.y);
    //   } else {
    //     this._move(entity, dt);
    //   }
    // });
  }
}
