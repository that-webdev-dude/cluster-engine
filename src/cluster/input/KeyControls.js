class KeyInput {
  /**
   * Key Input.
   * Handles a single input model state.
   * @returns {KeyInput}
   */
  constructor() {
    this.isActive = false;
    this.isDown = false;
  }

  /**
   * getInput()
   * @param {Boolean} isDown
   * @returns {Void}
   * @private
   */
  getInput(isDown) {
    if (this.isDown !== isDown) this.isActive = isDown;
    this.isDown = isDown;
  }
}

class KeyManager {
  #keyMap;

  /**
   * Game controller model.
   * Handles the input state.
   * The keyMap array must be given as constructor parameter.
   * This maps the key pressed (code) to an action name.
   * @param {Array<{code: string, action: string}>} keyMap - controller config
   */
  constructor(keyMap = []) {
    this.#keyMap = keyMap;
    this.#keyMap.forEach((keyItem) => {
      const { action } = keyItem;
      this[action] = new KeyInput();
    });

    this.#init();
  }

  /**
   * init():
   * Initialization function.
   * We add here the Controller event listeners
   * @returns {Void}
   * @private
   */
  #init() {
    window.addEventListener("keydown", (event) => {
      const { type, code, key } = event;
      this.#keyDownUp(type, code);
    });

    window.addEventListener("keyup", (event) => {
      const { type, code, key } = event;
      this.#keyDownUp(type, code);
    });
  }

  /**
   * keyDownUp():
   * Handles the controller input states
   * @returns {Void}
   * @private
   */
  #keyDownUp(type, code) {
    const isDown = type === "keydown" ? true : false;
    const keyItem =
      this.#keyMap.find((keyItem) => code === keyItem.code) || null;
    if (keyItem) {
      const { action } = keyItem;
      this[action].getInput(isDown);
    }
  }

  reset() {
    this.#keyMap.forEach((item) => {
      this[item.action].isActive = false;
      this[item.action].isDown = false;
    });
  }
}

class KeyControls {
  #controller = null;

  constructor() {
    const keyConfig = [
      { code: "ArrowUp", action: "moveUp" },
      { code: "ArrowDown", action: "moveDown" },
      { code: "ArrowLeft", action: "moveLeft" },
      { code: "ArrowRight", action: "moveRight" },
      { code: "KeyW", action: "moveUp" },
      { code: "KeyS", action: "moveDown" },
      { code: "KeyA", action: "moveLeft" },
      { code: "KeyD", action: "moveRight" },
      { code: "KeyX", action: "action" },
      { code: "KeyP", action: "pause" },
      { code: "Enter", action: "start" },
      { code: "Escape", action: "exit" },
      { code: "Space", action: "action" },
    ];

    this.#controller = new KeyManager(keyConfig);
  }

  // Helpers
  get x() {
    if (this.#controller.moveRight.isActive) return 1;
    if (this.#controller.moveLeft.isActive) return -1;
    return 0;
  }

  get y() {
    if (this.#controller.moveDown.isActive) return 1;
    if (this.#controller.moveUp.isActive) return -1;
    return 0;
  }

  get moveUp() {
    return this.#controller.moveUp.isActive;
  }

  get moveDown() {
    return this.#controller.moveDown.isActive;
  }

  get moveLeft() {
    return this.#controller.moveLeft.isActive;
  }

  get moveRight() {
    return this.#controller.moveRight.isActive;
  }

  get action() {
    return this.#controller.action.isActive;
  }

  get pause() {
    return this.#controller.pause.isActive;
  }

  get exit() {
    return this.#controller.exit.isActive;
  }

  get start() {
    return this.#controller.start.isActive;
  }

  reset() {
    this.#controller.reset();
  }
}

class DebugControls {}

export default KeyControls;
