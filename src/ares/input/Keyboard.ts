type KeyMap = {
  [key: string]: boolean;
};

class KeyboardInput {
  private _keys: KeyMap;
  private _preventDefaultKeys: Set<string>;
  public active: boolean;

  constructor() {
    this._keys = {};
    this._preventDefaultKeys = new Set([
      "ArrowLeft",
      "ArrowUp",
      "ArrowRight",
      "ArrowDown",
      "Space",
    ]);
    this.active = true;

    document.addEventListener("keydown", this._handleKeyDown.bind(this));
    document.addEventListener("keyup", this._handleKeyUp.bind(this));
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this._preventDefaultKeys.has(e.code)) {
      e.preventDefault();
    }
    this._keys[e.code] = true;
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    if (!this.active) this.active = true;
    if (this._preventDefaultKeys.has(e.code)) {
      e.preventDefault();
    }
    this._keys[e.code] = false;
  }

  get action(): boolean {
    return this.key("Space");
  }

  get pause(): boolean {
    return this.key("KeyP");
  }

  get x(): number {
    return (
      (Number(this.key("KeyD")) || Number(this.key("ArrowRight"))) -
      (Number(this.key("KeyA")) || Number(this.key("ArrowLeft")))
    );
  }

  get y(): number {
    return (
      (Number(this.key("KeyS")) || Number(this.key("ArrowDown"))) -
      (Number(this.key("KeyW")) || Number(this.key("ArrowUp")))
    );
  }

  key(key: string, value?: boolean): boolean {
    if (!this.active) return false;
    if (value !== undefined) {
      this._keys[key] = value;
    }

    return this._keys[key] || false;
  }

  reset(): void {
    this._keys = {};
  }
}

export default KeyboardInput;
