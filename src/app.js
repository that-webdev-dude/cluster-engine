import cluster from "./cluster/index.js";
import Level from "./levels/Level.js";

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
    height: GAME_HEIGHT,
  });

  // console.log("file: app.js ~ line 16 ~ level", level);
  game.scene.add(level);

  game.run(() => {
    // game update
  });
};
