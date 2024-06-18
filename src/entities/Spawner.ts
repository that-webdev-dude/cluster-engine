import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import { GAME_CONFIG } from "../config/GameConfig";
import { createEnemy } from "./generators/EnemyGenerator";

const { width: GAME_WIDTH } = GAME_CONFIG;

export class Spawner extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(GAME_WIDTH, 0),
    });
    const spawner = new Components.Spawner({
      spawnInterval: 0.125,
      spawnGenerator: () => createEnemy(),
    });

    this.attachComponent(transform);
    this.attachComponent(spawner);
  }
}
