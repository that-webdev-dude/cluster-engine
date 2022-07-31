/**
 * Key Input.
 * Handles a single input model state.
 */
class KeyInput {
  constructor() {
    this.isActive = false;
    this.isDown = false;
  }

  getInput(isDown) {
    if (this.isDown !== isDown) this.isActive = isDown;
    this.isDown = isDown;
  }
}

class KeyController {
  #keyMap;

  /**
   * Game controller.
   * Handles the input state.
   * The keyMap array must be given as constructor parameter.
   * This maps the key pressed (code) to an action name.
   * @param {Array} keyMap - Array of {code: String, action: String}
   */
  constructor(keyMap = []) {
    this.#keyMap = keyMap;
    this.#keyMap.forEach((keyItem) => {
      const { action } = keyItem;
      this[action] = new KeyInput();
    });

    this.#init();
  }

  #init() {
    window.addEventListener("keydown", (event) => {
      const { type, code } = event;
      this.keyDownUp(type, code);
    });

    window.addEventListener("keyup", (event) => {
      const { type, code } = event;
      this.keyDownUp(type, code);
    });
  }

  keyDownUp(type, code) {
    const isDown = type === "keydown" ? true : false;
    const keyItem = this.#keyMap.find((keyItem) => code === keyItem.code) || null;
    if (keyItem) {
      const { action } = keyItem;
      this[action].getInput(isDown);
    }
  }
}

// bridge class
// class KeyControls {
//   #controller = null;

//   constructor() {
//     this.#controller = new KeyController([
//       { code: "ArrowUp", action: "moveUp" },
//       { code: "ArrowDown", action: "moveDown" },
//       { code: "ArrowLeft", action: "moveLeft" },
//       { code: "ArrowRight", action: "moveRight" },
//       { code: "Space", action: "action" },
//     ]);
//   }

//   // Helpers
//   get x() {
//     if (this.#controller.moveRight.isActive) return 1;
//     if (this.#controller.moveLeft.isActive) return -1;
//     return 0;
//   }

//   get y() {
//     if (this.#controller.moveDown.isActive) return 1;
//     if (this.#controller.moveUp.isActive) return -1;
//     return 0;
//   }

//   get moveUp() {
//     return this.#controller.moveUp.isActive;
//   }

//   get moveDown() {
//     return this.#controller.moveDown.isActive;
//   }

//   get moveLeft() {
//     return this.#controller.moveLeft.isActive;
//   }

//   get moveRight() {
//     return this.#controller.moveRight.isActive;
//   }

//   get action() {
//     return this.#controller.action.isActive;
//   }

//   reset() {
//     return this;
//   }
// }

// export default KeyControls;
export default KeyController;
