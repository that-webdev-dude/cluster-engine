import { Game } from "./cluster";
import { GAME_CONFIG } from "./config/GameConfig";
import { GamePlay } from "./screens/GamePlay";
import { GameTitle } from "./screens/GameTitle";
import { GameOver } from "./screens/GameOver";

// game instance
const game = new Game({
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
});
game.addScene("gamePlay", () => new GamePlay(game));
game.addScene("gameTitle", () => new GameTitle(game));
game.addScene("gameOver", () => new GameOver(game));

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
