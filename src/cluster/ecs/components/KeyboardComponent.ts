import { Component } from "../../core/Component";

// Interface for component properties
export interface KeyboardOptions {
  actions?: Array<() => void>;
}

// Keyboard Controls Component
export class KeyboardComponent implements Component {
  active: boolean = true;
  keys: Map<string, boolean> = new Map(
    Object.entries({
      ArrowRight: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowUp: false,
      KeyA: false,
      KeyD: false,
      KeyW: false,
      KeyS: false,
      KeyP: false,
      Space: false,
      Escape: false,
    })
  );
  actions: Array<() => void> = [];

  constructor(options: KeyboardOptions) {
    if (options) {
      if (options.actions) this.actions = [...options.actions];
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
