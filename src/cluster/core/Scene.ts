import { Container } from "./Container";
import { Entity } from "./Entity";
import { System } from "./System";

type SystemContainer = Container<System>;

type EntityContainer = Container<Entity>;

interface SceneOptions {
  systems?: SystemContainer;
  entities?: EntityContainer;
  name?: string;
}

export class Scene {
  readonly name: string;
  readonly systems: SystemContainer;
  readonly entities: EntityContainer;

  constructor(
    {
      name = "default",
      systems = new Container<System>(),
      entities = new Container<Entity>(),
    }: SceneOptions = {
      name: "default",
      systems: new Container<System>(),
      entities: new Container<Entity>(),
    }
  ) {
    this.name = name;
    this.systems = systems;
    this.entities = entities;
  }

  private _updateSystems(dt: number, t: number) {
    if (this.systems.size === 0) return;
    this.systems.forEach((system) => {
      system.update(this.entities, dt, t);
    });
  }

  update(dt: number, t: number) {
    this._updateSystems(dt, t);
  }
}
