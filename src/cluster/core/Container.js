import Vector from "../utils/Vector";

class Container {
  constructor() {
    this.position = new Vector();
    this.children = [];
  }

  /** methods */
  map(f = () => {}) {
    return this.children.map(f);
  }

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
