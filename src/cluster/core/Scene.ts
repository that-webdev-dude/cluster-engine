import { Container } from "./Container";
import { Entity } from "./Entity";
import { System } from "./System";

export class Scene {
  readonly name: string;
  readonly systems: Container<System> = new Container();
  readonly entities: Container<Entity> = new Container();

  constructor(name: string) {
    this.name = name;
  }

  update(dt: number, t: number) {
    if (this.systems.size === 0) return;
    this.systems.forEach((system) => {
      if (system.update) {
        system.update(this.entities, dt, t);
      }
    });
  }
}
