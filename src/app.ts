import { Game } from "./ares";
import GamePlay from "./screens/GamePlay";
import GameTitle from "./screens/GameTitle";
import GameWin from "./screens/GameWin";

// GAME
const game = new Game({
  version: "0.0.1",
  title: "Space Strike",
  width: 832,
  height: 640,
});

const defaults = () => ({
  levelID: 1,
  scores: 0,
  lives: 3,
  timer: 120,
});
let globals = defaults();

const startGamePlay = () => {
  game.setScene(
    new GamePlay(game, {
      toStart: startGameTitle, // go to main menu (from a dialog or something)
      toEnd: startGameWin, // player wins || player dies (maybe game over is a dialog)
      toNext: startGamePlay, // next level and here globals are changed
    })
  );
};

const startGameWin = () => {
  game.setScene(
    new GameWin(game, {
      toNext: startGameTitle,
    })
  );
};

const startGameTitle = () => {
  globals = defaults(); // reset globals
  game.setScene(
    new GameTitle(game, {
      toNext: startGamePlay,
    })
  );
};

export default () => {
  // startGameTitle();
  // startGamePlay();
  startGameWin();
  game.start();
};

/**
 * (S) gameTitle → (S) gamePlay →  (S) gameWin → gameTitle
 *               → (D) gameQuit →      gameTitle
 *               → (D) gameOver →      gameTitle
 *                              →      gamePlay
 */
