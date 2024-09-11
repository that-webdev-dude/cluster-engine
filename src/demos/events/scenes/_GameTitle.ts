import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

export class GameTitle extends Cluster.Scene {
  constructor() {
    super();
    // entities
    this.addEntity(new Entities.RedBackgroundEntity());
    this.addEntity(new Entities.TitleTextEntity());
    this.addEntity(new Entities.ActionTextEntity());

    // systems
    this.addSystem(new Systems.RendererSystem());
  }

  update(dt: number, t: number) {
    if (Cluster.Keyboard.key("Enter")) {
      if (Cluster.Keyboard.active) {
        Cluster.Keyboard.active = false;
        store.emit<Events.GamePlayEvent>({ type: "game-play" });
      }
    }

    super.update(dt, t);
    store.processEvents();
  }
}
