import { enemyPool } from "./_Enemy";
import * as Cluster from "../../cluster";
import * as Components from "../components";

/** Mothership entity
 * @components EnhanceSpawner
 */
export class Mothership extends Cluster.Entity {
  constructor() {
    super();

    const spawner = new Components.SpawnerComponent({
      strategy: "enemy",
      pool: enemyPool,
      limit: 0,
      interval: 1,
    });

    this.components.set("Spawner", spawner);
  }
}
