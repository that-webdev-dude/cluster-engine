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
  const ships = new Container();
  for (let i = 0; i < 30; i++) {
    const ship = ships.add(new Sprite(new Texture(playerImageUrl)));
    ship.position.y = Math.random() * height;
    ship.position.x = Math.random() * width;
    ship.update = function (dt, t) {
      let { position } = this;
      position.x += dt * 200;
    };
  }

  // scene
  game.scene.add(ships);

  // start
  game.run((dt, t) => {
    ships.map((ship) => {
      let { position } = ship;
      if (position.x > width) {
        position.x = -32;
      }
    });
  });
};
