import Vector from "../utils/Vector";

class Container {
  constructor(position = new Vector()) {
    this.position = position;
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
