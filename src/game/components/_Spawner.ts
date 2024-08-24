import * as Cluster from "../../cluster";
import * as Strategies from "../strategies";

interface SpawnerOptions {
  strategy: Strategies.SpawnStrategyType;
  pool: Cluster.Pool<Cluster.Entity>;
  limit: number;
  interval: number;
}

/** Spawner component
 * @tag Spawner
 * @options strategy, pool, limit, interval
 * @properties count, timer
 */
class SpawnerComponent extends Cluster.Component {
  readonly strategy: Strategies.SpawnStrategyType;
  readonly interval: number = 0;
  readonly limit: number = 0;
  public count: number = 0;
  public timer: number = 0;
  readonly pool: Cluster.Pool<Cluster.Entity>;

  constructor({ limit, interval, strategy, pool }: SpawnerOptions) {
    super("Spawner");
    this.interval = interval;
    this.strategy = strategy;
    this.limit = limit;
    this.pool = pool;
  }
}

export { SpawnerComponent };
