import KeyController from "./KeyController";

class KeyControls {
  #controller = null;

  constructor() {
    this.#controller = new KeyController([
      { code: "ArrowUp", action: "moveUp" },
      { code: "ArrowDown", action: "moveDown" },
      { code: "ArrowLeft", action: "moveLeft" },
      { code: "ArrowRight", action: "moveRight" },
      { code: "Space", action: "action" },
    ]);
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

  reset() {
    return this;
  }
}

export default KeyControls;
