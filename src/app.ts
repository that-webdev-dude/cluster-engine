import { Game } from "./ares";
import GamePlay from "./screens/GamePlay";
import GameTitle from "./screens/GameTitle";
import GameWin from "./screens/GameWin";
import GameOver from "./screens/GameOver";

// GAME
const game = new Game({
  version: "0.0.1",
  title: "Space Strike",
  width: 832,
  height: 640,
});

const defaults = () => ({
  scores: 0,
  lives: 1,
});
let globals = defaults();

const startGamePlay = () => {
  game.setScene(
    new GamePlay(game, globals, {
      toStart: startGameTitle, // go to main menu (from a dialog or something)
      toEnd: startGameWin, // player wins || player dies (maybe game over is a dialog)
      toNext: startGamePlay, // next level and here globals are changed
      toPrevious: startGameOver,
    })
  );
};

const startGameWin = () => {
  game.setScene(
    new GameWin(game, globals, {
      toNext: startGameTitle,
    })
  );
};

const startGameOver = () => {
  game.setScene(
    new GameOver(game, globals, {
      toNext: startGameTitle,
    })
  );
};

const startGameTitle = () => {
  globals = defaults(); // reset globals
  game.setScene(
    new GameTitle(game, globals, {
      toNext: startGamePlay,
    })
  );
};

export default () => {
  startGameTitle();
  game.start(() => {});
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add pickups
// - add explosions
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
