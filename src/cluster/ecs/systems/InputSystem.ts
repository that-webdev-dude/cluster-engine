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

let systemEntities = new Container<Entity>();

export class InputSystem extends System {
  readonly _keyState: Map<string, boolean> = new Map();

  constructor() {
    super();

    document.addEventListener("keyup", this._handleKeyState.bind(this));
    document.addEventListener("keydown", this._handleKeyState.bind(this));
  }

  private _handleKeyState(e: KeyboardEvent): void {
    if (e.type === "keydown") {
      this._keyState.set(e.code, true);
    } else if (e.type === "keyup") {
      this._keyState.set(e.code, false);
    }
  }

  private _destroy(): void {
    // ...
  }

  public update(entities: Container<Entity>, dt: number): void {
    if (!entities.size) return;

    systemEntities = entities.filter((entity) =>
      entity.hasComponent(Components.Keyboard)
    );
    if (!systemEntities.size) return;

    systemEntities.forEach((entity) => {
      const keyboard = entity.getComponent(Components.Keyboard);
      if (!keyboard) return;

      this._keyState.forEach((value, key) => {
        if (keyboard.keys.has(key)) {
          keyboard.keys.set(key, value);
        }
      });

      keyboard.actions.forEach((action) => {
        action();
      });
    });

    systemEntities.clear();
  }
}
