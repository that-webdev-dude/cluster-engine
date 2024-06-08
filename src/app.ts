import { GAME_CONFIG } from "./config/GameConfig";
import { Game } from "./cluster";
import { gameplay } from "./scenes/gamePlay";

export default () => {
  const game = new Game({
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    title: "Shooter",
    version: "1.0.0",
  });

  game.addScene(gameplay);
  game.start();
};
