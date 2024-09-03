import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";
import * as Events from "../events";
import { store } from "../store";

function createArkanoidLevel(): Entities.BrickEntity[] {
  const brickWidth = 50;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 30;

  const level = [];

  for (let c = 0; c < 8; c++) {
    for (let r = 0; r < 5; r++) {
      const position = new Cluster.Vector(
        c * (brickWidth + brickPadding) + brickOffsetLeft,
        r * (brickHeight + brickPadding) + brickOffsetTop
      );
      level.push(new Entities.BrickEntity(position));
    }
  }

  return level;
}

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    // entities
    this.addEntity(new Entities.PlayerEntity());
    this.addEntity(new Entities.BallEntity());

    const level = createArkanoidLevel();
    level.forEach((brick) => this.addEntity(brick));

    // systems
    this.addSystem(new Systems.PlayerSystem());
    this.addSystem(new Systems.BallSystem());
    this.addSystem(new Systems.BoundarySystem());
    this.addSystem(new Systems.CollisionSystem());
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
