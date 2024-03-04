/**
 * that.webdev.dude - 2024
 * Container:
 * Represents a recursive structure that can hold entities or other containers as children.
 * It is used to group and organize entities and containers within the `children` array.
 * The `Container` class provides functionality to add and remove children, as well as update all children if they have an update function.
 * It can be instantiated to be a container of a specific `EntityType` or `ContainerType`.
 */
import { ContainerType, EntityType, Milliseconds, Seconds } from "../types";
import Vector from "../tools/Vector";

class Container<
  T extends EntityType | ContainerType = EntityType | ContainerType
> implements ContainerType
{
  position: Vector = new Vector();
  anchor: Vector = new Vector();
  dead: boolean = false;
  children: Array<T> = [];

  get size(): number {
    return this.children.length;
  }

  public add(child: T): T {
    this.children.push(child);
    return child;
  }

  public remove(child: T): T {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return child;
  }

  update(dt: Milliseconds, t: Seconds) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child && child.update) {
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
