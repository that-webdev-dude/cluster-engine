class KeyControls {
  constructor() {
    this.keys = {};

    document.addEventListener(
      "keydown",
      (e) => {
        if (["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Space"].indexOf(e.code)) {
          e.preventDefault();
        }
        this.keys[e.code] = true;
      },
      false
    );

    document.addEventListener(
      "keyup",
      (e) => {
        this.keys[e.code] = false;
      },
      false
    );
  }

  // Helpers
  get x() {
    if (this.keys["ArrowRight"]) return 1;
    if (this.keys["ArrowLeft"]) return -1;
    return 0;
  }

  get y() {
    if (this.keys["ArrowDown"]) return 1;
    if (this.keys["ArrowUp"]) return -1;
    return 0;
  }

  get moveUp() {
    return this.keys["ArrowUp"];
  }

  get moveDown() {
    return this.keys["ArrowDown"];
  }

  get moveLeft() {
    return this.keys["ArrowLeft"];
  }

  get moveRight() {
    return this.keys["ArrowRight"];
  }

  get action() {
    return this.keys["Space"];
  }
}

export default KeyControls;
