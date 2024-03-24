import { Vector } from "../tools/Vector";
import { Cluster } from "../types/cluster.types";
import { Entity } from "./Entity";

type ContainerChild = Entity | Container;

// implementation of a Container Entity class
export class Container
  implements Cluster.EntityContainerType<Cluster.BaseEntityOptions>
{
  readonly tag = Cluster.EntityTag.CONTAINER; // Discriminant property
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  alpha: number;
  dead: boolean;
  visible: boolean;
  children: Array<ContainerChild>;

  constructor(options: Cluster.BaseEntityOptions = {}) {
    this.acceleration = options.acceleration || new Vector(0, 0);
    this.velocity = options.velocity || new Vector(0, 0);
    this.position = options.position || new Vector(0, 0);
    this.anchor = options.anchor || new Vector(0, 0);
    this.scale = options.scale || new Vector(1, 1);
    this.pivot = options.pivot || new Vector(0, 0);
    this.angle = options.angle || 0;
    this.alpha = options.alpha || 1;
    this.dead = options.dead || false;
    this.visible = options.visible || true;
    this.children = [];
  }

  add(entity: ContainerChild) {
    this.children.push(entity);
  }

  remove(entity: ContainerChild) {
    const index = this.children.indexOf(entity);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  forEach<T>(callback: (entity: T) => void) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.tag !== Cluster.EntityTag.CONTAINER) {
        callback(child as T);
      } else {
        (child as Container).forEach(callback);
      }
    }
  }

  update(dt: Cluster.Milliseconds, t: Cluster.Milliseconds) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if ("update" in child && child.update) {
        (
          child.update as (
            dt: Cluster.Milliseconds,
            t: Cluster.Milliseconds
          ) => void
        )(dt, t);
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
