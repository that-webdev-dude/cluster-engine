import { Game } from "./cluster";
import { GAME_CONFIG } from "./config/GameConfig";

import { GamePlay } from "./screens/GamePlay";

// game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});

const gamePlay = () => {
  return new GamePlay(game);
};

// gameplay scene
export default () => {
  game.setScene(gamePlay());
  game.start();
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
