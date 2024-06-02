import { Container } from "./Container";
import { Entity } from "./Entity";
import { System } from "./System";

export class Scene {
  readonly name: string;
  private _entities: Container<Entity> = new Container();
  private _systems: Container<System> = new Container();

  constructor(name: string) {
    this.name = name;
  }

  addEntity(entity: Entity) {
    this._entities.add(entity);
  }

  removeEntity(entity: Entity) {
    this._entities.remove(entity);
  }

  addSystem(system: System) {
    this._systems.add(system);
  }

  removeSystem(system: System) {
    this._systems.remove(system);
  }

  update(dt: number, t: number) {
    if (this._systems.size === 0) return;
    this._systems.forEach((system) => {
      if (system.update) {
        system.update(this._entities, dt, t);
      }
    });
  }
}
