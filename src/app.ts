import { Game } from "./cluster";
import { GAME_CONFIG } from "./config/GameConfig";
import { GamePlay } from "./screens/GamePlay";

// game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});

// start the game
export default () => {
  game.setScene(new GamePlay(game));
  game.start();
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
