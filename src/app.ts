import { GAME_GLOBALS } from "./globals/GameGlobals";
import { GAME_CONFIG } from "./config/GameConfig";
import { Game } from "./ares";
import GameTitle from "./screens/GameTitle";
import GamePlay from "./screens/GamePlay";
import GameWin from "./screens/GameWin";
import GameOver from "./screens/GameOver";

// GAME
const game = new Game({ ...GAME_CONFIG });

const startGameEnd = () => {
  if (GAME_GLOBALS.isWin) {
    game.setScene(
      new GameWin(game, {
        toNext: startGameTitle,
      })
    );
  } else {
    console.log("You loose!");
    game.setScene(
      new GameOver(game, {
        toNext: startGameTitle,
      })
    );
  }
};

const startGameTitle = () => {
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
      toNext: startGameEnd,
      toFirst: startGameTitle,
    })
  );
};

export default () => {
  startGameTitle();
  game.start();
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
