class KeyControls {
  constructor() {
    this.keys = {};
    this.handleKeyDown = (e) => {
      if (
        ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Space"].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }
      this.keys[e.code] = true;
    };
    this.handleKeyUp = (e) => {
      this.keys[e.code] = false;
    };
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  get action() {
    return this.key("Space");
  }

  get x() {
    let x = 0;
    if (this.key("ArrowLeft") || this.key("KeyA")) {
      x -= 1;
    }
    if (this.key("ArrowRight") || this.key("KeyD")) {
      x += 1;
    }
    return x;
  }

  get y() {
    let y = 0;
    if (this.key("ArrowUp") || this.key("KeyW")) {
      y -= 1;
    }
    if (this.key("ArrowDown") || this.key("KeyS")) {
      y += 1;
    }
    return y;
  }

  key(key, value) {
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
