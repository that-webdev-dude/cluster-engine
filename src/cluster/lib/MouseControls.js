class MouseControls {
  constructor(container = document.body) {
    // state
    this.element = container;
    this.position = { x: 0, y: 0 };
    this.released = false; // true on the first frame only where released
    this.pressed = false; // true on the first frame only then pressed
    this.isDown = false; // true on mouse held down

    // handlers
    // TODO
    // ADD A SCREEN RESIZE HANDLER
    this.element.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("mousemove", this.move.bind(this), false);
    document.addEventListener("mousedown", this.down.bind(this), false);
    document.addEventListener("mouseup", this.up.bind(this), false);
  }

  //   helpers
  // ...

  //   internals
  #mousePositionFromEvent({ clientX, clientY }) {
    const { element, position } = this;
    const rect = element.getBoundingClientRect();
    const xRatio = element.width / element.clientWidth;
    const yRatio = element.height / element.clientHeight;
    position.x = (clientX - rect.left) * xRatio;
    position.y = (clientY - rect.top) * yRatio;
  }

  //   menbers
  up(e) {
    this.isDown = false;
    this.released = true;
  }

  down(e) {
    this.isDown = true;
    this.pressed = true;
    this.#mousePositionFromEvent(e);
  }

  move(e) {
    this.#mousePositionFromEvent(e);
  }

  update() {
    this.released = false;
    this.pressed = false;
  }
}

export default MouseControls;
