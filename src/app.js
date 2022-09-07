import GameScreen from "./screens/GameScreen.js";
import cluster from "./cluster/index.js";

export default () => {
  const { Game, KeyControls } = cluster;
  const controller = new KeyControls();
  const game = new Game({
    height: 48 * 10,
    width: 48 * 20,
  });

  game.scene = new GameScreen(game, controller);
  game.run(() => {});
};
