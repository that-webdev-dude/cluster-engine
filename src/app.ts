import { Cluster } from "./cluster/types/cluster.types";
import { store } from "./store/store";
import { Game } from "./cluster";
import { Scene } from "./cluster/core/Scene";
import { GameTitle } from "./scenes/gameTitle";
import { GamePlay } from "./scenes/gamePlay";

export default () => {
  const width = store.get("width");
  const height = store.get("height");
  const scenes = new Map([
    [
      "gameTitle",
      () => {
        return new GameTitle();
      },
    ],
    [
      "gamePlay",
      () => {
        return new GamePlay();
      },
    ],
  ]);

  const game = new Game({
    width,
    height,
    scenes,
  });

  const sceneHandler = (scene: string) => {
    game.setScene(scene);
  };
  store.on("scene-changed", sceneHandler);

  game.setScene(store.get("scene"));
  game.start();
};
