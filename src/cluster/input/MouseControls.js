class MouseControls {
  constructor(container = document.body) {
    // state
    // element is the canvas (if using canvas) otherwise is DOM body
    // position will store the mouse xy coords relative the the target element
    // released: true on the first frame only where released
    // pressed: true on the first frame only then pressed
    // down: true on mouse held down
    this.element = container;
    this.position = { x: 0, y: 0 };
    this.isReleased = false;
    this.isPressed = false;
    this.idDown = false;

    // handlers
    // TODO
    // ADD A SCREEN RESIZE HANDLER
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      //   e.preventDefault();
      this.#getCurrentPosition(e);
    });

    document.addEventListener("mousedown", (e) => {
      //   e.preventDefault();
      this.isDown = true;
      this.isPressed = true;
      this.#getCurrentPosition(e);
    });

    document.addEventListener("mouseup", (e) => {
      //   e.preventDefault();
      this.isDown = false;
      this.isReleased = true;
    });
  }

  //   internals
  #getCurrentPosition({ clientX, clientY }) {
    const { element, position } = this;
    const rect = element.getBoundingClientRect();
    const xRatio = element.width / element.clientWidth;
    const yRatio = element.height / element.clientHeight;
    position.x = (clientX - rect.left) * xRatio;
    position.y = (clientY - rect.top) * yRatio;
  }

  update() {
    this.isReleased = false;
    this.isPressed = false;
  }
}

export default MouseControls;
