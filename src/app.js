import buildingImageUrl from "./images/building.png";
import playerImageUrl from "./images/player.png";

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
  const width = 640;
  const height = 300;
  const game = new Game({ width, height });

  // controller
  const controller = new KeyControls();

  // game objects
  const ship = game.scene.add(new Sprite(new Texture(playerImageUrl)));
  ship.position.x = width / 2 - 16;
  ship.position.y = height / 2;
  ship.anchor.x = -16;
  ship.anchor.y = -16;
  ship.pivot.x = 16;
  ship.pivot.y = 16;

  ship.update = function (dt, t) {
    let flipped = controller.action;
    this.scale.x = flipped ? -1 : 1;
    this.anchor.x = flipped ? 32 : 0;
    ship.angle += 2;
  };

  // start
  game.run((dt, t) => {});
};
