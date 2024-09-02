import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    // entities
    this.addEntity(new Entities.PlayerEntity());
    this.addEntity(new Entities.BallEntity());

    // systems
    this.addSystem(new Systems.PlayerSystem());
    this.addSystem(new Systems.BallSystem());
    this.addSystem(new Systems.BoundarySystem());
    this.addSystem(new Systems.RendererSystem());

    // listeners
    store.on("entity-destroyed", (event: Events.EntityDestroyedEvent) => {
      this.removeEntity(event.data.entity);
    });
    store.on("entity-created", (event: Events.EntityCreatedEvent) => {
      this.addEntity(event.data.entity);
    });
  }

  update(dt: number, t: number) {
    super.update(dt, t);

    store.processEvents();
  }
}
