import { Scene, Container, Entity, System, Keyboard } from "../cluster";
import { MovementSystem } from "../systems/MovementSystem";
import { RenderSystem } from "../systems/RenderSystem";
import { Player } from "../entities/Character";
import { Enemy } from "../entities/Character";
import { store } from "../store";

export class GamePlay extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new Player());
    entities.add(new Enemy());

    const systems = new Container<System>();
    systems.add(new MovementSystem());
    systems.add(new RenderSystem());

    super({
      name: "GamePlay",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    if (Keyboard.enter) {
      store.dispatch("setGameScene", store.get("gameScenes").GameMenu);
      Keyboard.active = false;
    }

    super.update(dt, t);
  }
}
