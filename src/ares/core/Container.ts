import Vector from "../tools/Vector";
import { Renderable, Renderables } from "../types";
// import { Entity } from "./Entity";

// // TODO: needs to implement the renderables interface
class Container implements Renderables {
  public position: Vector;
  private _children: (Renderable | Renderables)[];

  constructor(position: Vector = new Vector()) {
    this.position = position;
    this._children = [];
  }

  get size(): number {
    return this._children.length;
  }

  get children(): (Renderable | Renderables)[] {
    return this._children;
  }

  public foreach(f: (child: Renderable | Renderables) => void): void {
    this._children.forEach(f);
  }

  public map(f: (child: Renderable | Renderables) => any): any[] {
    return this._children.map(f);
  }

  public add(child: Renderable | Renderables): void {
    this._children.push(child);
  }

  public remove(child: Renderable | Renderables): void {
    this._children = this._children.filter(
      (currentChild) => currentChild !== child
    );
  }

  // public update(dt: number, t: number, parent?: Renderables): void {
  //   this._children = this._children.filter((child) => {
  //     if (child instanceof Renderables) {
  //       child.update(dt, t, this);
  //     } else {
  //       child?.update && child?.update(dt, t);
  //       return !child.dead;
  //     }
  //     return true;
  //   });
  // }

  public update(dt: number, t: number): void {
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      child?.update && child.update(dt, t);
      if (child instanceof Container) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

// class Container {
//   public position: Vector;
//   private _children: (Entity | Container)[];

//   constructor(position: Vector = new Vector()) {
//     this.position = position;
//     this._children = [];
//   }

//   get size(): number {
//     return this._children.length;
//   }

//   get children(): (Entity | Container)[] {
//     return this._children;
//   }

//   public foreach(f: (child: Entity | Container) => void): void {
//     this._children.forEach(f);
//   }

//   public map(f: (child: Entity | Container) => any): any[] {
//     return this._children.map(f);
//   }

//   public add(child: Entity | Container): void {
//     this._children.push(child);
//   }

//   public remove(child: Entity | Container): void {
//     this._children = this._children.filter(
//       (currentChild) => currentChild !== child
//     );
//   }

//   public update(dt: number, t: number, parent?: Container): void {
//     this._children = this._children.filter((child) => {
//       if (child instanceof Container) {
//         child.update(dt, t, this);
//       } else {
//         child?.update && child?.update(dt, t);
//         return !child.dead;
//       }
//       return true;
//     });
//   }
// }

export default Container;
