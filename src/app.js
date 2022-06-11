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

  // game objects
  const buildings = game.scene.add(new Container());
  function makeRandomBuilding(building, x) {
    const { position, scale } = building;
    scale.x = math.randf(1, 3);
    scale.y = math.randf(1, 3);
    position.x = x;
    position.y = height - scale.y * 64;
  }
  for (let i = 0; i < 50; i++) {
    const building = buildings.add(new Sprite(new Texture(buildingImageUrl)));
    makeRandomBuilding(building, math.rand(width));
  }

  const ship = game.scene.add(new Sprite(new Texture(playerImageUrl)));
  ship.position.x = width / 2 - 216;
  ship.position.y = height / 2 - 124;
  ship.update = function (dt, t) {
    const { position } = this;
    position.y += Math.sin(20 * t);
  };

  // start
  game.run((dt, t) => {
    buildings.map((building) => {
      building.position.x -= 100 * dt;
      if (building.position.x < -80) {
        makeRandomBuilding(building, math.randf(width, width + 80));
      }
    });
  });
};
