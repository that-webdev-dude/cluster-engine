import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    // entities
    const playerEntity = new Entities.PlayerEntity();
    const shotgunEntity = new Entities.ShotgunEntity(playerEntity);

    // systems
    const playerSystem = new Systems.PlayerSystem();
    const shotgunSystem = new Systems.ShotgunSystem();
    const animationSystem = new Systems.AnimationSystem();
    const rendererSystem = new Systems.RendererSystem();

    // listeners

    // init
    this.addEntity(playerEntity);
    this.addEntity(shotgunEntity);

    this.addSystem(playerSystem);
    this.addSystem(shotgunSystem);
    this.addSystem(animationSystem);
    this.addSystem(rendererSystem);
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    store.processEvents();
  }
}
