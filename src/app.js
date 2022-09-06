import cluster from "./cluster/index.js";
import GameScreen from "./screens/GameScreen.js";
import Vector from "./cluster/utils/Vector.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();
  const game = new Game({
    height: 48 * 10,
    width: 48 * 20,
  });

  game.scene = new GameScreen(game, controller);
  game.run(() => {});
};
