import { Scene, Container, Entity, System, Keyboard, Vector } from "../cluster";
import { VisibilitySystem } from "../systems/VisibilitySystem";
import { RenderSystem } from "../systems/RenderSystem";
import { MenuBackground } from "../entities/Background";
import { ActionText } from "../entities/Text";
import { TitleText } from "../entities/Text";
import { store, GameScenes } from "../store";

export class GameMenu extends Scene {
  constructor() {
    const entities = new Container<Entity>();
    entities.add(new MenuBackground());
    entities.add(new TitleText());
    entities.add(new ActionText());

    const systems = new Container<System>();
    systems.add(new VisibilitySystem());
    systems.add(new RenderSystem());

    super({
      name: "GameMenu",
      entities,
      systems,
    });
  }

  update(dt: number, t: number) {
    // console.log("GameMenu update");
    if (Keyboard.key("Enter")) {
      store.dispatch("setGameScene", GameScenes.GamePlay);
      Keyboard.active = false;
    }

    super.update(dt, t);
  }
}
