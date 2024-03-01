import { GAME_GLOBALS } from "./globals/GameGlobals";
import { GAME_CONFIG } from "./config/GameConfig";
import { Game } from "./ares";
import GamePlay from "./screens/GamePlay";

// // GAME
const game = new Game({ ...GAME_CONFIG });

const startGamePlay = () => {
  game.setScene(
    new GamePlay(game, {
      toNext: () => console.log("toNext"),
      toFirst: () => console.log("toFirst"),
    })
  );
};

export default () => {
  startGamePlay();
  game.start();
};

// TODO
// - make the controller less specific to xbox
// - add sounds
// - add screen transitions
// - add entity flash effect
// - add camera flash effect
