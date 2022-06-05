class MouseControls {
  constructor(container) {
    this.element = container || document.body;
    // state
    this.position = { x: 0, y: 0 };
    this.isDown = false; // true on mouse held down
    this.pressed = false; // true on the first frame only then pressed
    this.released = false; // true on the first frame only where released
  }

  //   helpers
  // ...
}

export default MouseControls;
