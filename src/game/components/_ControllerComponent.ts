import * as Cluster from "../../cluster";

interface ControllerOptions {
  up?: string;
  down?: string;
  left?: string;
  right?: string;
  action?: string;
  pause?: string;
  quit?: string;
}

/** Controller component
 * the controller component is used to store the input of the player
 * @tag Controller
 * @options up, down, left, right, action, pause, quit
 * @properties up, down, left, right, action, pause, quit, x, y, direction
 */
class ControllerComponent extends Cluster.Component {
  private _direction: Cluster.Vector = new Cluster.Vector(0, 0);
  private _up: string = "ArrowUp";
  private _down: string = "ArrowDown";
  private _left: string = "ArrowLeft";
  private _right: string = "ArrowRight";
  private _action: string = "Space";
  private _pause: string = "Escape";
  private _quit: string = "KeyQ";

  constructor({
    up,
    down,
    left,
    right,
    action,
    pause,
    quit,
  }: ControllerOptions = {}) {
    super("Controller");
    if (up) this._up = up;
    if (down) this._down = down;
    if (left) this._left = left;
    if (right) this._right = right;
    if (action) this._action = action;
    if (pause) this._pause = pause;
    if (quit) this._quit = quit;
  }

  get up() {
    return Cluster.Keyboard.key(this._up);
  }

  get down() {
    return Cluster.Keyboard.key(this._down);
  }

  get left() {
    return Cluster.Keyboard.key(this._left);
  }

  get right() {
    return Cluster.Keyboard.key(this._right);
  }

  get action() {
    return Cluster.Keyboard.key(this._action);
  }

  get pause() {
    return Cluster.Keyboard.key(this._pause);
  }

  get quit() {
    return Cluster.Keyboard.key(this._quit);
  }

  get x() {
    return Number(this.right) - Number(this.left);
  }

  get y() {
    return Number(this.down) - Number(this.up);
  }

  get direction() {
    return this._direction.set(this.x, this.y).normalize();
  }
}

export { ControllerComponent };
