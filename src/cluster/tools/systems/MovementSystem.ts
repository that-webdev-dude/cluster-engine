/**
 * @File MovementSystem.ts
 * @Description Movement system to handle entity movement on input events or simply speed values
 * @Author @that.webdev.dude
 * @Year 2024
 */

import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Input } from "../components/Input";
import { Speed } from "../components/Speed";
import { Transform } from "../components/Transform";

/**
 * Represents a system responsible for moving the player based on input events or simply speed values.
 */
export class MovementSystem extends System {
  private _move(
    entity: Entity,
    dt: number,
    inputX: number = 1,
    inputY: number = 1
  ) {
    const { position } = entity.getComponent("Transform") as Transform;
    const speed = entity.getComponent("Speed") as Speed;
    if (position && speed) {
      position.x += inputX * speed.speed * dt;
      position.y += inputY * speed.speed * dt;
    }
  }

  /**
   * Updates the input system by processing input for each entity.
   * @param entities - The collection of entities to process input for.
   */
  update(entities: Container<Entity>, dt: number): void {
    entities.forEach((entity: Entity) => {
      const input = entity.getComponent("Input") as Input;
      if (input) {
        this._move(entity, dt, input.x, input.y);
      } else {
        this._move(entity, dt);
      }
    });
  }
}
