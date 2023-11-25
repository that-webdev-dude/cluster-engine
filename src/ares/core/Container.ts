import Vector from "../tools/Vector";
import { IEntity, IEntityContainer } from "../types";

class Container implements IEntityContainer {
  readonly children: Array<IEntity | IEntityContainer>;
  readonly position: Vector;

  constructor() {
    this.children = [];
    this.position = new Vector();
  }

  get size(): number {
    return this.children.length;
  }

  public add(child: IEntity | IEntityContainer) {
    this.children.push(child);
  }

  public remove(child: IEntity | IEntityContainer) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  public update(delta: number, elapsed: number) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.update(delta, elapsed);
      if ("dead" in child && child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

export default Container;
