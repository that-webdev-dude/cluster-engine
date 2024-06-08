import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";

export class SpeedSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

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

  update(dt: number): void {
    this._entities.forEach((entity: Entity) => {
      const keyboard = entity.getComponent(Components.Keyboard);

      if (keyboard) {
        this._move(entity, dt, keyboard.x, keyboard.y);
      } else {
        this._move(entity, dt);
      }
    });
  }
}
