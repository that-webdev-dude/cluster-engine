import { Vector } from "../tools/Vector";

export class Mouse {
  private _element: HTMLElement;
  private _position: Vector;
  private _isDown: boolean;
  private _isPressed: boolean;
  private _isReleased: boolean;

  constructor(container: HTMLElement = document.body) {
    this._element = container;
    this._position = new Vector();
    this._isDown = false;
    this._isPressed = false;
    this._isReleased = false;

    document.addEventListener("contextmenu", (e: Event) => e.preventDefault());
    document.addEventListener("mousemove", (e: MouseEvent) => this._move(e));
    document.addEventListener("mousedown", (e: MouseEvent) => this._down(e));
    document.addEventListener("mouseup", (e: MouseEvent) => this._up(e));
  }

  get position(): { x: number; y: number } {
    return { x: this._position.x, y: this._position.y };
  }

  get isDown(): boolean {
    return this._isDown;
  }

  get isPressed(): boolean {
    return this._isPressed;
  }

  get isReleased(): boolean {
    return this._isReleased;
  }

  private _getCurrentPosition({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }) {
    const { _element, _position } = this;
    const rect = _element.getBoundingClientRect();
    const xRatio = _element.clientWidth
      ? _element.offsetWidth / _element.clientWidth
      : 0;
    const yRatio = _element.clientHeight
      ? _element.offsetHeight / _element.clientHeight
      : 0;
    _position.x = (clientX - rect.left) * xRatio;
    _position.y = (clientY - rect.top) * yRatio;
  }

  private _move(e: MouseEvent) {
    this._getCurrentPosition(e);
  }

  private _down(e: MouseEvent) {
    this._isDown = true;
    this._isPressed = true;
    this._getCurrentPosition(e);
  }

  private _up(e: MouseEvent) {
    this._isDown = false;
    this._isReleased = true;
    this._getCurrentPosition(e);
  }

  update() {
    this._isReleased = false;
    this._isPressed = false;
  }
}

export default Mouse;
