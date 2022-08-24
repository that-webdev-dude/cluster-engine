import GameScreen from "./screens/GameScreen.js";
import cluster from "./cluster/index.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();

  const game = new Game({ height: 432, width: 912 });

  const gameScreen = new GameScreen(game, controller);

  game.scene = gameScreen;
  game.run(() => {});
};
