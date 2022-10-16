import Vector from "../utils/Vector";

class MouseControls {
  constructor(container = document.body) {
    // state
    // element is the canvas (if using canvas) otherwise is DOM body
    // position will store the mouse xy coords relative the the target element
    // released: true on the first frame only where released
    // pressed: true on the first frame only then pressed
    // down: true on mouse held down
    this.element = container;
    this.position = new Vector();
    this.isDown = false;
    this.isPressed = false;
    this.isReleased = false;

    // handlers
    // TODO
    // ADD A SCREEN RESIZE HANDLER
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("mousemove", (e) => this.move(e));
    document.addEventListener("mousedown", (e) => this.down(e));
    document.addEventListener("mouseup", (e) => this.up(e));
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

  move(e) {
    this.#getCurrentPosition(e);
  }

  down(e) {
    this.isDown = true;
    this.isPressed = true;
    this.#getCurrentPosition(e);
  }

  up(e) {
    this.isDown = false;
    this.isReleased = true;
    this.#getCurrentPosition(e);
  }

  update() {
    this.isReleased = false;
    this.isPressed = false;
  }
}

export default MouseControls;
