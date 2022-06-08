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
    this.children = this.children.filter((child) => {
      if (child.update) {
        child.update(dt, t);
      }
      return child.dead ? false : true;
    });
  }
}

export default Container;
