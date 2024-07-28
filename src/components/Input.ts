import { Component } from "../cluster";
import { Keyboard } from "../cluster";

// Component errors
// enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  action: string;
  pause: string;
  quit: string;
  enter: string;
  right: string;
  down: string;
  left: string;
  up: string;
}

// Transform Component
export class Input implements Component {
  [key: string]: any;
  private _action: string;
  private _pause: string;
  private _quit: string;
  private _enter: string;
  private _right: string;
  private _down: string;
  private _left: string;
  private _up: string;

  constructor(options: ComponentOptions) {
    this._action = options.action;
    this._pause = options.pause;
    this._quit = options.quit;
    this._enter = options.enter;
    this._right = options.right;
    this._down = options.down;
    this._left = options.left;
    this._up = options.up;
  }

  get action() {
    return Keyboard.key(this._action);
  }

  get pause() {
    return Keyboard.key(this._pause);
  }

  get quit() {
    return Keyboard.key(this._quit);
  }

  get enter() {
    return Keyboard.key(this._enter);
  }

  get right() {
    return Keyboard.key(this._right) || Keyboard.key("ArrowRight");
  }

  get down() {
    return Keyboard.key(this._down) || Keyboard.key("ArrowDown");
  }

  get left() {
    return Keyboard.key(this._left) || Keyboard.key("ArrowLeft");
  }

  get up() {
    return Keyboard.key(this._up) || Keyboard.key("ArrowUp");
  }

  get x() {
    return (
      (Number(this.right) || Number(Keyboard.key("ArrowRight"))) -
      (Number(this.left) || Number(Keyboard.key("ArrowLeft")))
    );
  }

  get y() {
    return (
      (Number(this.down) || Number(Keyboard.key("ArrowDown"))) -
      (Number(this.up) || Number(Keyboard.key("ArrowUp")))
    );
  }

  get active() {
    return Keyboard.active;
  }

  set active(value: boolean) {
    Keyboard.active = value;
  }
}
