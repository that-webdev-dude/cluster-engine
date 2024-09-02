import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    const player = new Entities.PlayerEntity();
    const enemy = new Entities.EnemyEntity();
    const uiText = new Entities.UITextEntity();
    this.addEntity(player);
    this.addEntity(enemy);
    this.addEntity(uiText);

    const PlayerSystem = new Systems.PlayerSystem();
    const BoundarySystem = new Systems.BoundarySystem();
    const CollisionSystem = new Systems.CollisionSystem();
    const RendererSystem = new Systems.RendererSystem();
    this.addSystem(PlayerSystem);
    this.addSystem(BoundarySystem);
    this.addSystem(CollisionSystem);
    this.addSystem(RendererSystem);

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
