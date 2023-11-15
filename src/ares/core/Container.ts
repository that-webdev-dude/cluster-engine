import Vector from "../tools/Vector";
import { Entity } from "./Entity";

class Container {
  public dead: boolean;
  public alpha: number;
  public visible: boolean;
  public position: Vector;
  private _children: (Entity | Container)[];

  constructor(position: Vector = new Vector()) {
    this.position = position;
    this.visible = true;
    this.alpha = 1;
    this.dead = false;
    this._children = [];
  }

  get size(): number {
    return this._children.length;
  }

  public foreach(f: (child: Entity | Container) => void): void {
    this._children.forEach(f);
  }

  public map(f: (child: Entity | Container) => any): any[] {
    return this._children.map(f);
  }

  public add(child: Entity | Container): Entity | Container {
    this._children.push(child);
    return child;
  }

  public remove(child: Entity | Container): Entity | Container {
    this._children = this._children.filter(
      (currentChild) => currentChild !== child
    );
    return child;
  }

  public update(dt: number, t: number, parent?: Container): void {
    this._children = this._children.filter((child) => {
      if (child instanceof Entity || child instanceof Container) {
        child?.update && child.update(dt, t, this);
        return !child.dead;
      }
      return true;
    });
  }
}

export default Container;

// import Vector from "../tools/Vector";
// import { Entity } from "./Entity";

// class Container {
//   public alpha: number;
//   public visible: boolean;
//   public position: Vector;
//   private _children: (Entity | Container)[];

//   constructor(position: Vector = new Vector()) {
//     this.position = position;
//     this.visible = true;
//     this.alpha = 1;
//     this._children = [];
//   }

//   get size(): number {
//     return this._children.length;
//   }

//   public foreach(f: (child: Entity | Container) => any = () => {}): void {
//     for (let i = 0; i < this._children.length; i++) {
//       f(this._children[i]);
//     }
//   }

//   public map(f: (child: Entity | Container) => any = () => {}): any[] {
//     return this._children.map(f);
//   }

//   public add(child: Entity | Container): Entity | Container {
//     this._children.push(child);
//     return child;
//   }

//   public remove(child: Entity | Container): Entity | Container {
//     this._children = this._children.filter(
//       (currentChild) => currentChild !== child
//     );
//     return child;
//   }

//   public update(dt: number, t: number, parent?: Container): void {
//     for (let i = 0; i < this._children.length; i++) {
//       const child = this._children[i];
//       if (child.update && typeof child.update === "function") {
//         child.update(dt, t, this);
//       }
//       if ("dead" in child && child.dead) {
//         this._children.splice(i, 1);
//         i--;
//       }
//     }
//   }
// }

// export default Container;
