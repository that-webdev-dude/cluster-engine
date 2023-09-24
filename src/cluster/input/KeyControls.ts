class KeyControls {
  private keys: { [key: string]: boolean } = {};

  private handleKeyDown = (e: KeyboardEvent) => {
    if (
      ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Space"].includes(
        e.code
      )
    ) {
      e.preventDefault();
    }
    this.keys[e.code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  constructor() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  get action(): boolean {
    return this.key("Space");
  }

  get x(): number {
    let x = 0;
    if (this.key("ArrowLeft") || this.key("KeyA")) {
      x -= 1;
    }
    if (this.key("ArrowRight") || this.key("KeyD")) {
      x += 1;
    }
    return x;
  }

  get y(): number {
    let y = 0;
    if (this.key("ArrowUp") || this.key("KeyW")) {
      y -= 1;
    }
    if (this.key("ArrowDown") || this.key("KeyS")) {
      y += 1;
    }
    return y;
  }

  key(key: string, value?: boolean): boolean {
    if (value !== undefined) {
      this.keys[key] = value;
    }
    return this.keys[key] || false;
  }

  reset() {
    this.keys = {};
  }
}

export default KeyControls;
