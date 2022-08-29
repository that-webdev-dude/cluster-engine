import Player from "./entities/Player.js";
import cluster from "./cluster/index.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();

  const game = new Game({ height: 432, width: 912 });
  const player = game.scene.add(new Player(controller, game));

  game.run(() => {
    // game scene here...
  });
};
