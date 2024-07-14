import { Scene, Container, Entity, System, Keyboard, Vector } from "../cluster";
import { RenderSystem } from "../cluster/ecs/systems/RenderSystem";
import { Background } from "../entities/Background";
import { Text } from "../entities/Text";
import { store } from "../store";

export class GameMenu extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new Background("#000000"));
    entities.add(
      new Text(
        new Vector(
          store.get("screenWidth") / 2,
          store.get("screenHeight") / 2 - 64
        ),
        "Game Menu",
        "#ffffff",
        64
      )
    );
    entities.add(
      new Text(
        new Vector(
          store.get("screenWidth") / 2,
          store.get("screenHeight") / 2 + 32
        ),
        "Press Enter to Start",
        "#ffffff",
        20
      )
    );

    const systems = new Container<System>();
    systems.add(new RenderSystem());

    super({
      name: "GameMenu",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    console.log("GameMenu update");
    if (Keyboard.enter) {
      store.dispatch("setGameScene", store.get("gameScenes").GamePlay);
      Keyboard.active = false;
    }

    super.update(dt, t);
  }
}
