import cluster from "./cluster/index.js";
const { Game } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // controller
  // ...

  // game objects
  // ...

  // game logic
  game.run((dt, t) => {});
};
