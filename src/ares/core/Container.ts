import { EntityType, EntityContainerType } from "../types";
import Vector from "../tools/Vector";

// interface IEntityContainer<T extends EntityType | EntityContainerType>
//   extends EntityContainerType {
//   children: Array<T>;
// }

// class Container<T extends EntityType | EntityContainerType>
//   implements IEntityContainer<T>
// {
//   readonly position: Vector;
//   readonly anchor: Vector;
//   public dead: boolean;
//   public children: Array<T>;

//   constructor() {
//     this.children = [];
//     this.position = new Vector();
//     this.anchor = new Vector();
//     this.dead = false;
//   }

//   // ... rest of your methods
//   get size(): number {
//     return this.children.length;
//   }

//   public add(child: T): T {
//     this.children.push(child);
//     return child;
//   }

//   public remove(child: T): T {
//     const index = this.children.indexOf(child);
//     if (index > -1) {
//       this.children.splice(index, 1);
//     }
//     return child;
//   }

//   public update(dt: number, t: number) {
//     this.children = this.children.filter((child) => {
//       if ("update" in child) {
//         child.update(dt, t);
//       }
//       return !("dead" in child && child.dead);
//     });
//   }
// }

interface IEntityContainer extends EntityContainerType {}
interface IEntityContainerConfig {
  // TODO: add to Container class constructor
  position?: Vector;
  anchor?: Vector;
}

class Container implements IEntityContainer {
  readonly position: Vector;
  readonly anchor: Vector;
  public dead: boolean;
  public children: Array<EntityType | EntityContainerType>;

  constructor() {
    this.children = [];
    this.position = new Vector();
    this.anchor = new Vector();
    this.dead = false;
  }

  get size(): number {
    return this.children.length;
  }

  public add(
    child: EntityType | EntityContainerType
  ): EntityType | EntityContainerType {
    this.children.push(child);
    return child;
  }

  public remove(
    child: EntityType | EntityContainerType
  ): EntityType | EntityContainerType {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return child;
  }

  public update(dt: number, t: number) {
    this.children = this.children.filter((child) => {
      if ("update" in child) {
        child.update(dt, t);
      }
      return !("dead" in child && child.dead);
    });
  }
}

export default Container;
