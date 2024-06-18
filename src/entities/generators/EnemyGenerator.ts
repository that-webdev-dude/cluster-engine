import { Cluster } from "../../cluster/types/cluster.types";
import { Components } from "../../cluster/ecs";
import { Cmath } from "../../cluster";
import { Enemy } from "../Enemy";
import { GAME_CONFIG } from "../../config/GameConfig";

const { width: GAME_WIDTH, height: GAME_HEIGHT } = GAME_CONFIG;

export const createEnemy: Cluster.EntityGenerator<Enemy> = () => {
  const enemy = new Enemy();
  const transformComponent = enemy.getComponent(Components.Transform);
  if (transformComponent) {
    transformComponent.position.x = GAME_WIDTH;
    transformComponent.position.y = Cmath.rand(32, GAME_HEIGHT - 64);
  }
  const speedComponent = enemy.getComponent(Components.Speed);
  if (speedComponent) {
    speedComponent.speed.x = Cmath.rand(-150, -50);
    speedComponent.speed.y = 0;
  }
  return enemy;
};
