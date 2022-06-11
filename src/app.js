import playerImageUrl from "./images/player.png";

import cluster from "./cluster/index.js";
const { KeyControls } = cluster;
const { Container } = cluster;
const { Texture } = cluster;
const { Sprite } = cluster;
const { Text } = cluster;
const { Game } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 300;
  const game = new Game({ width, height });

  // game objects
  const ship = game.scene.add(new Sprite(new Texture(playerImageUrl)));

  ship.position.x = -32;
  ship.position.y = height / 2 - 16;
  ship.update = function (dt, t) {
    let { position, scale } = this;
    position.x += dt * 200;
    scale.x = 1.5 * Math.abs(Math.sin(t * 1.5));
    scale.y = 2.5 * Math.abs(Math.sin(t * 1.5));
    if (position.x > width) {
      position.x = -32;
    }
  };

  // start
  game.run((dt, t) => {});
};
