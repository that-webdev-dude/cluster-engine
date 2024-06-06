/**
 * @File InputSystem.ts
 * @Description Input system to handle user input
 * @Author @that.webdev.dude
 * @Year 2024
 */

import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Input } from "../components/Input";

/**
 * Represents a system responsible for handling input.
 */
export class InputSystem extends System {
  /**
   * Updates the input system by processing input for each entity.
   * @param entities - The collection of entities to process input for.
   */
  update(entities: Container<Entity>): void {
    entities.forEach((entity: Entity) => {
      const input = entity.getComponent("Input") as Input;
      if (input) {
        console.log(input.x, input.y);
      }
    });
  }
}
