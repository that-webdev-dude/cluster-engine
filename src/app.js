import cluster from "./cluster/index.js";
const { Game } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // resources
  // ...

  // controller
  // ...

  // game objects
  // ...

  // game objects
  // ...

  // start
  game.run((dt, t) => {});
};
