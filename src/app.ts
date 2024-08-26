import * as Cluster from "./cluster";
import { GamePlay } from "./demos/events/scenes/GamePlay";

const height = 600;
const width = 800;

export default () => {
  const game = new Cluster.Game({
    height,
    width,
  });

  game.setScene(new GamePlay());
  game.start();
};

// TODO: dispay doesn't resize. fix this
