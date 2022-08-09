import cluster from "./cluster/index.js";
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
    width: GAME_WIDTH * 2,
    height: GAME_HEIGHT * 2,
  });

  const player = new Player(new KeyControls(), level);

  game.scene.add(level);
  game.scene.add(player);

  game.run(() => {
    // game update
  });
};
