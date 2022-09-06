import cluster from "./cluster/index.js";
// import Player from "./entities/Player.js";
// import Level from "./levels/Level.js";
import GameScreen from "./screens/GameScreen.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();
  const game = new Game({
    height: 48 * 10,
    width: 48 * 20,
  });

  // const level = game.scene.add(new Level(game));
  // const player = game.scene.add(new Player(controller, game, level));

  game.scene = new GameScreen(game, controller);
  game.run(() => {});
};
