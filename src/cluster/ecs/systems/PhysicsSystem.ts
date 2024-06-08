import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";

/**
 * Represents a system responsible for handling physics.
 */
export class PhysicsSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

  update(dt: number): void {
    if (!this._entities.size) return;

    this._entities.forEach((entity) => {
      const keyboard = entity.getComponent(Components.Keyboard);
      if (keyboard) {
        // console.log(keyboard.x, keyboard.y);
      }
    });
  }
}
