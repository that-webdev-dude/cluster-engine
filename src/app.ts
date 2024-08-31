import * as Cluster from "./cluster";
import * as Scenes from "./demos/events/scenes";

const width = 800;
const height = 600;
export default () => {
  const game = new Cluster.Game({
    height,
    width,
  });

  game.setScene(new Scenes.GamePlay());
  game.start();
};

// TODO: dispay doesn't resize. fix this
