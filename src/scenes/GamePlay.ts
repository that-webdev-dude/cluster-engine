import { Scene, Container, Entity, System, Keyboard } from "../cluster";
import { RenderSystem } from "../cluster/ecs/systems/RenderSystem";
// import { Systems } from "../cluster/ecs";

import { store } from "../store";

export class GamePlay extends Scene {
  constructor() {
    const entities = new Container<Entity>();

    const systems = new Container<System>();
    systems.add(new RenderSystem());

    super({
      name: "GamePlay",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    console.log("GamePlay update");
    if (Keyboard.enter) {
      store.dispatch("setGameScene", store.get("gameScenes").GameMenu);
      Keyboard.active = false;
    }

    super.update(dt, t);
  }
}
