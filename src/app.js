import backgroundImageUrl from "./images/background.png";
import playerImageUrl from "./images/player.png";
import bulletImageUrl from "./images/bullet.png";
import enemyImageUrl from "./images/enemy.png";

import cluster from "./cluster/index.js";
import Texture from "./cluster/core/Texture";
import KeyControls from "./cluster/input/KeyControls";
import Sprite from "./cluster/core/Sprite";
const { CanvasRenderer } = cluster;
const { Container } = cluster;
const { Engine } = cluster;

// requirements
// controllable player
// bullets
// enemies
// pace of waves
// collisions
// game over if enemy get past the player

export default () => {
  // game setup
  const width = 640;
  const height = 300;
  const renderer = new CanvasRenderer(width, height);
  document.querySelector("#app").appendChild(renderer.view);

  const textures = {
    background: new Texture(backgroundImageUrl),
    player: new Texture(playerImageUrl),
    bullet: new Texture(bulletImageUrl),
    enemy: new Texture(enemyImageUrl),
  };

  const controls = new KeyControls();

  // game objects
  const scene = new Container();

  const background = new Sprite(textures.background);
  background.position.x = 0;
  background.position.y = 0;
  scene.add(background);

  const player = new Sprite(textures.player);
  player.speed = 200;
  player.position.x = 120;
  player.position.y = height / 2 - 16;
  player.update = function (dt) {
    const { position, speed } = this;
    position.x += (dt / 1000) * speed * controls.x;
    position.y += (dt / 1000) * speed * controls.y;
    if (position.x > width - 32) position.x = width - 32;
    if (position.x < 0) position.x = 0;
    if (position.y > height - 32) position.y = height - 32;
    if (position.y < 0) position.y = 0;
  };
  scene.add(player);

  const bullets = new Container();
  function fire(x, y) {
    const bullet = new Sprite(textures.bullet);
    bullet.position.x = x;
    bullet.position.y = y;
    bullet.dead = false;
    bullet.update = function (dt) {
      const { position } = this;
      position.x += (dt / 1000) * 200;
      if (bullet.position.x > width + 20) {
        bullet.dead = true;
      }
    };
    bullets.add(bullet);
  }
  scene.add(bullets);

  // state variables
  let lastShot = 0;

  // game loop
  const gameLoop = new Engine(
    (dt) => {
      lastShot += dt / 1000;
      if (controls.action && lastShot > 0.15) {
        fire(player.position.x + 24, player.position.y + 10);
        lastShot = 0;
      }
      scene.update(dt);
    },
    () => {
      renderer.render(scene);
    }
  );

  gameLoop.start();
};
