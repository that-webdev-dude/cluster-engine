import { EntityType, EntityContainerType } from "../types";
import Vector from "../tools/Vector";

interface IEntityContainer extends EntityContainerType {}
interface IEntityContainerConfig {
  // TODO: add to Container class constructor
  position?: Vector;
  anchor?: Vector;
}

class Container implements IEntityContainer {
  public children: Array<EntityType | EntityContainerType>;
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
    this.children = this.children.filter((child) => {
      if ("update" in child) {
        child.update(delta, elapsed);
      }
      return !("dead" in child && child.dead);
    });
  }
}

export default Container;
