import { Cluster } from "./cluster/types/cluster.types";
import { store } from "./store/GameStore";
import { Game } from "./cluster";
import { Scene } from "./cluster/core/Scene";
import { GameScene1 } from "./scenes/gameScene1";
import { GameScene2 } from "./scenes/gameScene2";

const createGameScene1: Cluster.Creator<Scene> = () => {
  return new GameScene1();
};
const createGameScene2: Cluster.Creator<Scene> = () => {
  return new GameScene2();
};
export default () => {
  const width = store.get("width");
  const height = store.get("height");
  const scenes = new Map([
    ["gameScene1", createGameScene1],
    ["gameScene2", createGameScene2],
  ]);

  const game = new Game({
    width,
    height,
    scenes,
  });

  setTimeout(() => {
    store.dispatch("setScene", "gameScene2");
  }, 2000);

  setTimeout(() => {
    store.dispatch("setScene", "gameScene1");
  }, 3000);

  console.log(store.get("scene"));
  const sceneHandler = (scene: string) => {
    game.setScene(scene);
  };
  store.on("scene-changed", sceneHandler);

  game.setScene(store.get("scene"));
  game.start();
};
