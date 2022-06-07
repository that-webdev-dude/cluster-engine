import textureSrc from "./images/spaceship.png";
import cluster from "./cluster/index.js";
const { CanvasRenderer } = cluster;
const { Container } = cluster;
const { Engine } = cluster;
const { Text } = cluster;
const { Texture } = cluster;
const { Sprite } = cluster;

export default () => {
  // game setup
  const width = 832;
  const height = 640;
  const renderer = new CanvasRenderer(width, height);
  document.querySelector("#app").appendChild(renderer.view);

  // game objects
  const scene = new Container();

  const texture = new Texture(textureSrc);
  for (let i = 0; i < 50; i++) {
    const speed = Math.random() * 150 + 50;
    const ship = new Sprite(texture);
    ship.position.x = Math.random() * width;
    ship.position.y = Math.random() * height;
    ship.update = function (dt) {
      ship.position.x += (speed / 1000) * dt;
      ship.position.y += (speed / 1000) * dt;
      if (ship.position.x > width) {
        ship.position.x = -32;
      }
      if (ship.position.y > height) {
        ship.position.y = -32;
      }
    };
    scene.add(ship);
  }

  const gameLoop = new Engine(
    (dt) => {
      scene.update(dt);
    },
    () => {
      renderer.render(scene);
    }
  );

  gameLoop.start();
};
