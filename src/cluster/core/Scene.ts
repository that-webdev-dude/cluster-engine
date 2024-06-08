import { Container } from "./Container";
import { Entity } from "./Entity";
import { System } from "./System";

interface SceneOptions {
  entities?: Container<Entity>;
  systems?: Container<System>;
  name?: string;
}

export class Scene {
  readonly name: string;
  readonly systems: Container<System>;
  readonly entities: Container<Entity>;

  constructor(
    {
      name = "default",
      entities = new Container<Entity>(),
      systems = new Container<System>(),
    }: SceneOptions = {
      name: "default",
      entities: new Container<Entity>(),
      systems: new Container<System>(),
    }
  ) {
    this.name = name;
    this.entities = entities;
    this.systems = systems;
  }

  update(dt: number, t: number) {
    if (this.systems.size === 0) return;
    this.systems.forEach((system) => {
      if (system.update) {
        system.update(dt, t);
      }
    });
  }
}
