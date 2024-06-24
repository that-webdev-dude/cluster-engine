import { Game } from "./cluster";
import { GameTitle } from "./scenes/GameTitle";
import { GamePlay } from "./scenes/GamePlay";
import { store } from "./store";

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
