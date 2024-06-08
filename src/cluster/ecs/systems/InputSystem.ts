// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout;

//   return function (this: any, ...args: Parameters<T>) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(this, args), wait);
//   };
// }

import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";

/**
 * Represents a system responsible for handling input.
 */
export class InputSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;

    // Bind the context of the event handlers
    this._handleKeyEvent = this._handleKeyEvent.bind(this);

    document.addEventListener("keydown", this._handleKeyEvent);
    document.addEventListener("keyup", this._handleKeyEvent);
  }

  private _handleKeyEvent(event: KeyboardEvent): void {
    const isPressed = event.type === "keydown";
    this._updateKey(event.code, isPressed);
  }

  /**
   * Updates the state of a key for each entity.
   * @param code
   * @param isPressed
   */
  private _updateKey(code: string, isPressed: boolean): void {
    if (!this._entities.size) return;

    this._entities.forEach((entity) => {
      const keyboard = entity.getComponent(Components.Keyboard);
      if (keyboard?.keys.has(code)) {
        keyboard.keys.set(code, isPressed);
      }
    });
  }

  /**
   * Clean up event listeners when the system is destroyed.
   */
  destroy(): void {
    document.removeEventListener("keydown", this._handleKeyEvent);
    document.removeEventListener("keyup", this._handleKeyEvent);
  }
}
