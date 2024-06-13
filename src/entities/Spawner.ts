import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import { GAME_CONFIG } from "../config/GameConfig";
import { createEnemy } from "./Enemy";

const { width: GAME_WIDTH, height: GAME_HEIGHT } = GAME_CONFIG;

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
