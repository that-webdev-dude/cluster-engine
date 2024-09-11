import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

export class GameOver extends Cluster.Scene {
  constructor() {
    super();
    // entities
    this.addEntity(new Entities.RedBackgroundEntity());
    this.addEntity(new Entities.GameOverTextEntity());
    this.addEntity(new Entities.ActionTextEntity());

    // systems
    this.addSystem(new Systems.RendererSystem());
  }

  update(dt: number, t: number) {
    if (Cluster.Keyboard.key("Enter")) {
      if (Cluster.Keyboard.active) {
        Cluster.Keyboard.active = false;
        store.emit<Events.GameTitleEvent>({ type: "game-title" });
      }
    }

    super.update(dt, t);
    store.processEvents();
  }
}
