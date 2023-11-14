import Vector from "../tools/Vector";
import Entity from "./Entity";

// interface Entity {
//   position: Vector;
//   height: number;
//   width: number;
//   dead: boolean;
//   update: (dt: number, t: number, parent?: Container) => void;
// }

class Container {
  position: Vector;
  children: Entity[];

  constructor(position: Vector = new Vector()) {
    this.position = position;
    this.children = [];
  }

  map(f: (entity: Entity) => any = () => {}): any[] {
    return this.children.map(f);
  }

  add(entity: Entity): Entity {
    this.children.push(entity);
    return entity;
  }

  remove(entity: Entity): Entity {
    this.children = this.children.filter(
      (currentChild) => currentChild !== entity
    );
    return entity;
  }

  update(dt: number, t: number, parent?: Container): void {
    for (let i = 0; i < this.children.length; i++) {
      const entity = this.children[i];
      if (entity.update) {
        entity.update(dt, t, this);
      }
      if (entity.dead) {
        this.children.splice(i, 1);
        i--;
      }
    }
  }
}

export default Container;
