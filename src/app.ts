import { Game } from "./cluster";
import { GAME_CONFIG } from "./config/GameConfig";
import { GamePlay } from "./screens/GamePlay";
import { GameTitle } from "./screens/GameTitle";

// game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});
game.addScenes({
  gamePlay: () => new GamePlay(game),
  gameTitle: () => new GameTitle(game),
});

// start the game
export default () => {
  game.setScene("gameTitle");
  game.start();
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect

// ADDITIONAL NOTES
// - the game is not yet optimized for mobile
// - the game is not yet optimized for performance
// - the game is not yet optimized for accessibility
// - the game is not yet optimized for search engines
