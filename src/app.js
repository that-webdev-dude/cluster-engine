import cluster from "./cluster/index.js";
import Pickup from "./entities/Pickup.js";
import Player from "./entities/Player.js";
import Level from "./levels/Level.js";
import entity from "./cluster/utils/entity.js";
import GameScreen from "./screens/GameScreen.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();

  const game = new Game({ height: 432, width: 912 });

  const gameScreen = new GameScreen(game, controller);

  game.scene = gameScreen;

  game.run(() => {});
};
