import { Component } from "../cluster";

export class Input extends Component {
  private static _instance: Input;
  keys: Map<string, boolean> = new Map();
  active: boolean = true;

  constructor() {
    if (Input._instance) {
      return Input._instance;
    }

    super("Input");

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      this.keys.set(event.code, true);
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      this.keys.set(event.code, false);
    });

    Input._instance = this;
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
    return this.right ? 1 : this.left ? -1 : 0;
  }

  get y(): number {
    return this.down ? 1 : this.up ? -1 : 0;
  }
}
