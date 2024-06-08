import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";

/**
 * Represents a system responsible for handling input.
 */
export class InputSystem extends System {
  private _entities: Entity[];

  constructor(entities: Entity[]) {
    super();
    this._entities = entities;

    // Bind the context of the event handlers
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);

    document.addEventListener("keydown", this._handleKeyDown);
    document.addEventListener("keyup", this._handleKeyUp);
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    this._updateKey(event.code, true);
  }

  private _handleKeyUp(event: KeyboardEvent): void {
    this._updateKey(event.code, false);
  }

  private _updateKey(code: string, isPressed: boolean): void {
    this._entities.forEach((entity) => {
      const keyboard = entity.getComponent(Components.Keyboard);

      if (keyboard) {
        if (keyboard.keys.has(code)) {
          keyboard.keys.set(code, isPressed);
        }
      }
    });
  }

  /**
   * Updates the input system by processing input for each entity.
   * @param entities - The collection of entities to process input for.
   */
  // update(entities: Container<Entity>): void {
  //   //  ...
  // }
}
