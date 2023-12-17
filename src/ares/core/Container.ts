import { EntityType, EntityContainerType } from "../types";
import Vector from "../tools/Vector";

interface IEntityContainer extends EntityContainerType {}
interface IEntityContainerConfig {
  // TODO: add to Container class constructor
  position?: Vector;
  anchor?: Vector;
}

class Container implements IEntityContainer {
  readonly children: Array<EntityType | EntityContainerType>;
  readonly position: Vector;
  readonly anchor: Vector;

  constructor() {
    this.children = [];
    this.position = new Vector();
    this.anchor = new Vector();
  }

  get size(): number {
    return this.children.length;
  }

  public add(child: EntityType | EntityContainerType) {
    this.children.push(child);
  }

  public remove(child: EntityType | EntityContainerType) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  public update(delta: number, elapsed: number) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child) {
        child.update(delta, elapsed);
      }
      if ("dead" in child && child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

export default Container;
