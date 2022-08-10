import cluster from "./cluster/index.js";
import Pickup from "./entities/Pickup.js";
import Player from "./entities/Player.js";
import Level from "./levels/Level.js";
import entity from "./cluster/utils/entity.js";

const { Game, KeyControls } = cluster;
const GAME_WIDTH = 480 * 2 - 48;
const GAME_HEIGHT = 480 - 48;

export default () => {
  const controller = new KeyControls();
  const game = new Game({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  });

  const level = new Level({
    width: GAME_WIDTH,
    height: GAME_HEIGHT * 2,
  });
  game.scene.add(level);

  const player = new Player(controller, level);
  game.scene.add(player);

  const pickup = new Pickup();
  game.scene.add(pickup);

  game.run(() => {
    // game update
  });
};
