import cluster from "./cluster/index.js";
import LogoScreen from "./screens/LogoScreen.js";
import TitleScreen from "./screens/TitleScreen.js";
import GameScreen from "./screens/GameScreen.js";
import GameoverScreen from "./screens/GameOverScreen.js";

import Text from "./cluster/core/Text.js";

const { Game, KeyControls } = cluster;

export default () => {
  // helpers

  // setup
  const width = 640;
  const height = 320;
  const controller = new KeyControls();
  const game = new Game({ width, height });

  // game.scene = new GameScreen(game, controller);
  game.scene = new LogoScreen(game);

  game.run();
};
