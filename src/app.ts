import { Game } from "./cluster";
import { GAME_CONFIG } from "./config/GameConfig";

// ... game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});
game.addScenes({
  // ... add scenes here
});

// ... start the game
export default () => {
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
