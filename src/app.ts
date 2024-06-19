import { GAME_CONFIG } from "./config/GameConfig";
import { Game } from "./cluster";
import { store, GameScene } from "./store/store";
import { gameTitle } from "./scenes/gameTitle";
import { gamePlay } from "./scenes/gamePlay";

export default () => {
  const game = new Game({
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
  });

  game.addScene(gameTitle);
  game.addScene(gamePlay);

  store.on("scene-changed", () => {
    console.log("Scene changed to", store.get("scene"));
    game.setScene(store.get("scene"));
  });

  game.setScene(store.get("scene"));
  game.start();
};
