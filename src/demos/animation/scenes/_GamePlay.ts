import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    // entities
    const zombieEntity = new Entities.ZombieEntity();

    // systems
    const animationSystem = new Systems.AnimationSystem();
    const rendererSystem = new Systems.RendererSystem();

    // listeners

    // init
    this.addEntity(zombieEntity);

    this.addSystem(animationSystem);
    this.addSystem(rendererSystem);
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    store.processEvents();
  }
}
