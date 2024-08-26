import * as Cluster from "../../../cluster";
import * as Entities from "../entities";
import * as Systems from "../systems";

export class GamePlay extends Cluster.Scene {
  constructor() {
    super();

    const player = new Entities.PlayerEntity();
    const enemy = new Entities.EnemyEntity();

    this.addEntity(player);
    this.addEntity(enemy);

    this.addSystem(new Systems.BoundarySystem());
    this.addSystem(new Systems.RendererSystem());
  }
}
