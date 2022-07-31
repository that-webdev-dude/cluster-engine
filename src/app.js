import cluster from "./cluster/index.js";
import LogoScreen from "./screens/LogoScreen.js";
import TitleScreen from "./screens/TitleScreen.js";
import GameScreen from "./screens/GameScreen.js";
import GameoverScreen from "./screens/GameoverScreen.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();
  const game = new Game({
    width: 640,
    height: 320,
  });

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

  game.run(() => {});
};
