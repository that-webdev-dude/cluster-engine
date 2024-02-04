import {
  Seconds,
  Milliseconds,
  Updateable,
  Deadable,
  ContainerType,
} from "../types";
import Vector from "../tools/Vector";

type ChildType = Deadable & (Updateable | {});

class Container implements ContainerType {
  dead: boolean = false;
  children: Array<ContainerType | ChildType> = [];
  position: Vector = new Vector();
  anchor: Vector = new Vector();

  get size(): number {
    return this.children.length;
  }

  public add(child: ChildType | ContainerType): ChildType | ContainerType {
    this.children.push(child);
    return child;
  }

  public remove(child: ChildType | ContainerType): ChildType | ContainerType {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return child;
  }

  update(dt: Milliseconds, t: Seconds) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child) {
        child.update(dt, t);
      }
      if (child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

export default Container;
