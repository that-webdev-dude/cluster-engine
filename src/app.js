import cluster from "./cluster/index.js";
import LogoScreen from "./screens/LogoScreen.js";
import TitleScreen from "./screens/TitleScreen.js";
import GameScreen from "./screens/GameScreen.js";
import GameoverScreen from "./screens/GameoverScreen.js";

const { Game, KeyControls } = cluster;

export default () => {
  // helpers

  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });
  const controller = new KeyControls();

  // helpers
  const newGame = () => {
    game.scene = new GameScreen(game, controller, gameoverScreen);
  };

  const titleScreen = () => {
    game.scene = new TitleScreen(game, controller, newGame);
  };

  const gameoverScreen = () => {
    game.scene = new GameoverScreen(game, controller, titleScreen);
  };

  game.scene = new LogoScreen(game, titleScreen);
  game.run();
};
