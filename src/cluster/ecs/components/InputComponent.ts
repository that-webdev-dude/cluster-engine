import { Component } from "../../core/Component";

export class InputComponent implements Component {
  private static _instance: InputComponent;
  keys: Map<string, boolean> = new Map();
  active: boolean = true;

  private constructor() {
    if (InputComponent._instance) {
      return InputComponent._instance;
    }

    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));

    InputComponent._instance = this;
  }

  static get instance(): InputComponent {
    if (!this._instance) {
      this._instance = new InputComponent();
    }
    return this._instance;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.active) {
      this.keys.set(event.code, true);
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (this.active) {
      this.keys.set(event.code, false);
    }
  }

  get left(): boolean {
    return this.keys.get("KeyA") || this.keys.get("ArrowLeft") || false;
  }

  get right(): boolean {
    return this.keys.get("KeyD") || this.keys.get("ArrowRight") || false;
  }

  get up(): boolean {
    return this.keys.get("KeyW") || this.keys.get("ArrowUp") || false;
  }

  get down(): boolean {
    return this.keys.get("KeyS") || this.keys.get("ArrowDown") || false;
  }

  get space(): boolean {
    return this.keys.get("Space") || false;
  }

  get action(): boolean {
    return this.keys.get("Space") || false;
  }

  get pause(): boolean {
    return this.keys.get("KeyP") || false;
  }

  get quit(): boolean {
    return this.keys.get("Escape") || false;
  }

  get x(): number {
    return (this.right ? 1 : 0) - (this.left ? 1 : 0);
  }

  get y(): number {
    return (this.down ? 1 : 0) - (this.up ? 1 : 0);
  }
}
