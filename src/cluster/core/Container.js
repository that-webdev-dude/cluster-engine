class Container {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.children = [];
  }

  /** methods */
  add(child) {
    this.children.push(child);
    return child;
  }

  remove(child) {
    this.children = this.children.filter((currentChild) => currentChild !== child);
    return child;
  }

  update(dt, t) {
    this.children.forEach((child) => {
      if (child.update) {
        child.update(dt, t);
      }
    });
  }
}

export default Container;
