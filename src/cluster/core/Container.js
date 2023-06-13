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
    this.children = this.children.filter(
      (currentChild) => currentChild !== child
    );
    return child;
  }

  update(dt, t, parent) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.update) {
        child.update(dt, t, this);
      }
      if (child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

export default Container;
