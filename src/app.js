import cluster from "./cluster/index.js";
const { KeyControls } = cluster;
const { Container } = cluster;
const { Texture } = cluster;
const { Sprite } = cluster;
const { Text } = cluster;
const { Game } = cluster;
const { math } = cluster;

export default () => {
  // setup
  const WIDTH = 640;
  const HEIGHT = 300;
  const game = new Game({ WIDTH, HEIGHT });

  // controller

  // game objects

  // start
  game.run((dt, t) => {});
};
