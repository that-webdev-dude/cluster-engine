import { store } from "./game/store";
import * as Cluster from "./cluster";
import * as Scenes from "./game/scenes";

const height = store.get("screenHeight");
const width = store.get("screenWidth");

export default () => {
  const game = new Cluster.Game({
    height,
    width,
  });

  // listeners
  store.on("lives-changed", () => {
    if (store.get("lives") <= 0) {
      game.setScene(new Scenes.GameTitle(game));
    }
  });

  game.setScene(new Scenes.GamePlay(game));
  game.start();
};

// TODO: dispay doesn't resize. fix this
