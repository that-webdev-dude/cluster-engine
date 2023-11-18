import Vector from "../tools/Vector";
import { Entity } from "./Entity";

class Container {
  public position: Vector;
  private _children: (Entity | Container)[];

  constructor(position: Vector = new Vector()) {
    this.position = position;
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
      child?.update && child.update(dt, t, this);
      if (child instanceof Entity) return !child.dead;
      return true;
    });
  }
}

export default Container;
