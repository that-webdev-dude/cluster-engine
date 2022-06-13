import cluster from "./cluster/index.js";
import Player from "./entities/Player";

const { Texture } = cluster;
const { Sprite } = cluster;
const { Game } = cluster;
const { math } = cluster;

export default () => {
  // setup
  const WIDTH = 640;
  const HEIGHT = 300;
  const game = new Game({ WIDTH, HEIGHT });
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // resources
  // ...

  // controller

  // game objects
  // ...

  // game objects
  const background = game.scene.add(new Sprite(new Texture(backgroundImageUrl)));

  for (let i = 0; i < 100; i++) {
    const player = game.scene.add(new Player());
    player.position.x = math.rand(width - 32);
    player.position.y = math.rand(height - 32);
  }

  // start
  game.run((dt, t) => {});
};
