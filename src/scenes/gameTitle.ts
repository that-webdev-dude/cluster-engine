import { Scene, Container, Entity, System } from "../cluster";
import { Systems } from "../cluster/ecs";
import { Keyboard } from "../cluster/input";
import { TitleBackground } from "../entities/UIBackground";
import { UITitle } from "../entities/UITitle";
import { store } from "../store/store";

export class GameTitle extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new TitleBackground());
    entities.add(new UITitle());

    const systems = new Container<System>();
    systems.add(new Systems.Input(entities));
    systems.add(new Systems.Render(entities));

    super({
      name: "gameTitle",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    if (Keyboard.key("Space")) {
      store.dispatch("setScene", "gamePlay");
    }
  }
}
