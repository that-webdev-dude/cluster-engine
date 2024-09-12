class Keyboard {
  private _keys: Map<string, boolean> = new Map();
  private _preventDefaultKeys: Set<string> = new Set([
    // Add specific keys here
  ]);
  private static _instance: Keyboard;

  public active: boolean = true;

  private constructor() {
    document.addEventListener("keydown", this._handleKeyDown.bind(this));
    document.addEventListener("keyup", this._handleKeyUp.bind(this));
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this._preventDefaultKeys.has(e.code)) {
      e.preventDefault();
    }
    this._keys.set(e.code, true);
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    if (!this.active) this.active = true;
    if (this._preventDefaultKeys.has(e.code)) {
      e.preventDefault();
    }
    this._keys.set(e.code, false);
  }

  public static getInstance(): Keyboard {
    if (!Keyboard._instance) {
      Keyboard._instance = new Keyboard();
    }
    return Keyboard._instance;
  }

  public key(key: string, value?: boolean): boolean {
    if (!this.active) return false;
    if (value !== undefined) {
      this._keys.set(key, value);
    }

    return this._keys.get(key) || false;
  }

  public x(): number {
    return (
      (Number(this.key("ArrowRight")) || Number(this.key("KeyD"))) -
      (Number(this.key("ArrowLeft")) || Number(this.key("KeyA")))
    );
  }

  public y(): number {
    return (
      (Number(this.key("ArrowDown")) || Number(this.key("KeyS"))) -
      (Number(this.key("ArrowUp")) || Number(this.key("KeyW")))
    );
  }

  public reset(): void {
    this._keys.clear();
  }

  public destroy(): void {
    document.removeEventListener("keydown", this._handleKeyDown.bind(this));
    document.removeEventListener("keyup", this._handleKeyUp.bind(this));
  }
}

export const keyboardInstance = Keyboard.getInstance();
