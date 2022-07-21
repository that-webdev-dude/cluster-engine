import cluster from "./cluster/index.js";
import Squizz from "./entities/Squizz.js";
import Baddie from "./entities/Baddie.js";
import Level from "./levels/Level";
import Container from "./cluster/core/Container.js";
import GameScreen from "./screens/GameScreen.js";

const { Game, KeyControls, Camera, math, entity } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;

  const controller = new KeyControls();
  const game = new Game({ width, height });

  game.scene = new GameScreen(game, controller);
  game.run();
};
