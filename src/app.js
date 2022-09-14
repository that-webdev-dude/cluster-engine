import GameScreen from "./screens/GameScreen.js";
import cluster from "./cluster/index.js";

export default () => {
  const { Game, KeyControls } = cluster;
  const input = new KeyControls();
  const game = new Game({
    width: 960,
    height: 480,
  });

  game.scene = new GameScreen(game, input);
  game.run(() => {});
};
