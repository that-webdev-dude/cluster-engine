import { GAME_CONFIG } from "./config/GameConfig";
import { GAME_GLOBALS } from "./globals/GameGlobals";
import { Game } from "./ares";
import GameTitle from "./screens/GameTitle";
import GamePlay from "./screens/GamePlay";
// import GameWin from "./screens/GameWin";
// import GameOver from "./screens/GameOver";

// GAME
const game = new Game({ ...GAME_CONFIG });

const startGameEnd = () => {
  if (GAME_GLOBALS.isWin) {
    console.log("You win!");
    // game.setScene(
    //   new GameWin(game, globals, {
    //     toNext: startGameTitle,
    //   })
    // );
  } else {
    console.log("You loose!");
    // game.setScene(
    //   new GameOver(game, globals, {
    //     toNext: startGameTitle,
    //   })
    // );
  }
};

const startGameTitle = () => {
  // globals = defaults(); // reset globals
  GAME_GLOBALS.reset();
  game.setScene(
    new GameTitle(game, {
      toNext: startGamePlay,
    })
  );
};

const startGamePlay = () => {
  game.setScene(
    new GamePlay(game, {
      // toStart: startGameTitle,
      // toEnd: startGameWin,
      toNext: startGameEnd,
      // toPrevious: startGameOver,
    })
  );
};

export default () => {
  startGameTitle();
  game.start();
};

// TODO
// - make the game transition names more meaningful
// - make the controller less specific to xbox
// - add sounds
// - add pickups
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
