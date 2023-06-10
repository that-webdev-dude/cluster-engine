import KeyController from "./KeyController";

class KeyControls {
  #controller = null;

  constructor() {
    this.#controller = new KeyController([
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

export default KeyControls;
