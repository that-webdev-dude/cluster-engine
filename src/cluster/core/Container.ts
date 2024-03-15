import { Cluster } from "../types/cluster.types";
import { Entity } from "./Entity";

type ChildType = Cluster.EntityType | Cluster.EntityContainerType;

export class Container extends Entity implements Cluster.EntityContainerType {
  public children: Array<ChildType>;

  constructor(options: Cluster.EntityContainerOptions = {}) {
    super(Cluster.EntityTag.CONTAINER, options as Cluster.EntityOptions);
    this.children = [];
  }

  add(entity: ChildType): ChildType {
    this.children.push(entity);
    return entity;
  }

  remove(entity: ChildType): ChildType {
    const index = this.children.indexOf(entity);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return entity;
  }

  update(dt: number, t: number) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child && child.update) {
        (child.update as (dt: number, t: number) => void)(dt, t);
      }

      // TODO
      // Use of Array.splice() in EntityContainer.update():
      // This can be performance-intensive for large arrays.
      // Consider using a different data structure, like a linked list,
      // for better performance when removing elements.
      if ("dead" in child && child.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

export default Container;
