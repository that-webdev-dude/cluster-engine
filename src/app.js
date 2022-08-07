import cluster from "./cluster/index.js";

const { Game, KeyControls } = cluster;

export default () => {
  const controller = new KeyControls();
  const game = new Game({
    width: 640,
    height: 320,
  });

  game.run(() => {});
};
