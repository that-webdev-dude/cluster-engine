import { Scene, Container, Entity, System, Keyboard } from "../cluster";
import { CollisionSystem } from "../systems/CollisionSystem";
import { ResolutionSystem } from "../systems/ResolutionSystem";
import { MovementSystem } from "../systems/MovementSystem";
import { RenderSystem } from "../systems/RenderSystem";
import { BoundarySystem } from "../systems/BoundarySystem";
import { Player } from "../entities/Character";
import { Enemy } from "../entities/Character";
import { store, GameScenes } from "../store";

export class GamePlay extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new Player());
    entities.add(new Enemy());

    const systems = new Container<System>();
    systems.add(new MovementSystem());
    systems.add(new BoundarySystem());
    systems.add(new CollisionSystem());
    systems.add(new ResolutionSystem());
    systems.add(new RenderSystem());

    super({
      name: "GamePlay",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    if (Keyboard.key("Escape")) {
      store.dispatch("setGameScene", GameScenes.GameMenu);
      Keyboard.active = false;
    }

    super.update(dt, t);
  }
}
