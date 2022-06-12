import backgroundImageUrl from "./images/background.png";
import cluster from "./cluster/index.js";
import Player from "./entities/Player";

const { Texture } = cluster;
const { Sprite } = cluster;
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
  const background = game.scene.add(new Sprite(new Texture(backgroundImageUrl)));
  const player = game.scene.add(new Player());

  // start
  game.run((dt, t) => {});
};
