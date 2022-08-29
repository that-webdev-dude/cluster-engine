import cluster from "./cluster/index.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();

  const game = new Game({ height: 432, width: 912 });

  game.run(() => {
    // game code here...
  });
};
