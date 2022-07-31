// ThatWebdevDude - 2022

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

class KeyController {
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
      const { type, code } = event;
      this.#keyDownUp(type, code);
    });

    window.addEventListener("keyup", (event) => {
      const { type, code } = event;
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
    const keyItem = this.#keyMap.find((keyItem) => code === keyItem.code) || null;
    if (keyItem) {
      const { action } = keyItem;
      this[action].getInput(isDown);
    }
  }
}
export default KeyController;
