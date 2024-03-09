import { Cluster } from "../types/cluster.types";
import { Entity } from "./Entity";

export class Container extends Entity implements Cluster.EntityContainerType {
  public children: Array<Cluster.EntityType | Cluster.EntityContainerType>;

  constructor(options: Cluster.EntityContainerOptions = {}) {
    super(Cluster.EntityTag.CONTAINER, options as Cluster.EntityOptions);
    this.children = [];
  }

  add(
    entity: Cluster.EntityType | Cluster.EntityContainerType
  ): Cluster.EntityType | Cluster.EntityContainerType {
    this.children.push(entity);
    return entity;
  }

  remove(
    entity: Cluster.EntityType | Cluster.EntityContainerType
  ): Cluster.EntityType | Cluster.EntityContainerType {
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
