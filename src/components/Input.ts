import { Component } from "../cluster";
import { Keyboard } from "../cluster";

// Component errors
// enum ComponentErrors {}

// Interface for component properties
// export interface ComponentOptions {}

// Transform Component
export class Input implements Component {
  get action() {
    return Keyboard.action;
  }

  get pause() {
    return Keyboard.pause;
  }

  get quit() {
    return Keyboard.quit;
  }

  get enter() {
    return Keyboard.enter;
  }

  get x() {
    return Keyboard.x;
  }

  get y() {
    return Keyboard.y;
  }

  get active() {
    return Keyboard.active;
  }

  set active(value: boolean) {
    Keyboard.active = value;
  }
}
