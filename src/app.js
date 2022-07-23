import cluster from "./cluster/index.js";
import LogoScreen from "./screens/LogoScreen.js";
import TitleScreen from "./screens/TitleScreen.js";
import GameScreen from "./screens/GameScreen.js";
import GameoverScreen from "./screens/GameOverScreen.js";

const { Game, KeyControls } = cluster;

export default () => {
  // helpers

  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });
  const controller = new KeyControls();

  // game.scene = new GameScreen(game, controller);
  // game.scene = new LogoScreen(game, () => {
  //   console.log("done");
  // });
  game.scene = new TitleScreen(game, controller, () => console.log("start"));

  game.run();
};
