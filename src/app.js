import backgroundImageUrl from "./images/background.png";
import playerImageUrl from "./images/player.png";
import bulletImageUrl from "./images/bullet.png";
import enemyImageUrl from "./images/enemy.png";

import cluster from "./cluster/index.js";
const { CanvasRenderer } = cluster;
const { KeyControls } = cluster;
const { Container } = cluster;
const { Texture } = cluster;
const { Engine } = cluster;
const { Sprite } = cluster;
const { Text } = cluster;

export default () => {
  // game setup
  // we set the canvas width and height
  // the game display is a nice 300px height corridor
  const width = 640;
  const height = 300;
  const renderer = new CanvasRenderer(width, height);
  document.querySelector("#app").appendChild(renderer.view);

  // assets
  // we group all the textures in an object
  // the props are references to the loaded images
  const textures = {
    background: new Texture(backgroundImageUrl),
    player: new Texture(playerImageUrl),
    bullet: new Texture(bulletImageUrl),
    enemy: new Texture(enemyImageUrl),
  };

  // game controls
  // we play with the arrows to move the ship
  // we use space to fire the bullets
  const controls = new KeyControls();

  // game objects
  // background is just a static image
  const background = new Sprite(textures.background);
  background.position.x = 0;
  background.position.y = 0;

  // player
  // position and speed are initialised
  // the update function is responsible to update the player position
  // a check for collision is included to trap the player inside the screen
  const player = new Sprite(textures.player);
  player.speed = 400;
  player.position.x = 120;
  player.position.y = height / 2 - 16;
  player.dead = false;
  player.update = function (dt) {
    const { position, speed } = this;
    position.x += (dt / 1000) * speed * controls.x;
    position.y += (dt / 1000) * speed * controls.y;
    if (position.x > width - 32) position.x = width - 32;
    if (position.x < 0) position.x = 0;
    if (position.y > height - 32) position.y = height - 32;
    if (position.y < 0) position.y = 0;
  };

  // bullets
  // container of bullet type
  // bullet gets spawned and added to the container
  // if goes offscreen it gets removed from the container through the dead flag
  const bullets = new Container();
  function spawnBullet(x, y) {
    const bullet = new Sprite(textures.bullet);
    bullet.speed = 200;
    bullet.position.x = x;
    bullet.position.y = y;
    bullet.dead = false;
    bullet.update = function (dt) {
      const { position, speed } = this;
      position.x += (dt / 1000) * speed;
      if (bullet.position.x > width + 20) {
        bullet.dead = true;
      }
    };
    bullets.add(bullet);
  }

  // enemies
  // container of enemy type
  // enemy gets spawned and added to the container
  // if goes offscreen it gets removed from the container through the dead flag
  // for the enemy spawner, speed is passed in to vary the pace of the
  // enemy waves
  const enemies = new Container();
  function spawnEnemy(x, y, speed) {
    const enemy = new Sprite(textures.enemy);
    enemy.position.x = x;
    enemy.position.y = y;
    enemy.dead = false;
    enemy.update = function (dt) {
      this.position.x += (dt / 1000) * speed;
      if (enemy.position.x < -32) {
        enemy.dead = true;
      }
    };
    enemies.add(enemy);
  }

  // score message
  // keeps track of the killed enemies
  // late kills are more valuable than early kills
  const score = new Text("SCORE: 0", {
    font: "20px 'Press Start 2p'",
    fill: "red",
    align: "center",
  });
  score.position.x = width / 2;
  score.position.y = height - 30;
  score.update = function (dt, amount) {
    if (amount) score.text = `SCORE: ${amount}`;
  };

  // scene
  // scene layer gets populated with the game objects
  // order is important especially for the background
  const scene = new Container();
  scene.add(background);
  scene.add(player);
  scene.add(bullets);
  scene.add(enemies);
  scene.add(score);

  // game state
  // includes game globals
  // includes also a gameover handler
  let totalTime = 0;
  let lastShotTime = 0;
  let lastEnemyTime = 0;
  let enemySpawnSpeed = 2;
  let scoreAmount = 0;
  let gameOver = false;
  function doGameOver() {
    const message = new Text("GAME OVER!", {
      font: "30px 'Press Start 2p'",
      fill: "red",
      align: "center",
    });
    message.position.x = width / 2;
    message.position.y = height / 2 - 15;
    scene.remove(player);
    scene.add(message);
    gameOver = true;
  }

  // game loop
  const gameLoop = new Engine(
    (dt) => {
      totalTime += dt / 1000;

      // we control the shooting rate by totalTime - lastShotTime > 0.1
      // to avoid spawning 60 bullets per second (fps)
      if (!gameOver && controls.action && totalTime - lastShotTime > 0.1) {
        lastShotTime = totalTime;
        spawnBullet(player.position.x + 24, player.position.y + 10);
      }

      // enemy spawner
      if (totalTime - lastEnemyTime > enemySpawnSpeed) {
        const speed = -25 - Math.random() * Math.random() * 50;
        const positionX = width;
        const positionY = Math.floor(Math.random() * (height - 24 + 1));
        spawnEnemy(positionX, positionY, speed);
        enemySpawnSpeed = enemySpawnSpeed < 0.05 ? 0.6 : enemySpawnSpeed * 0.75 + 0.001;
      }

      // colision detection between bullets and enemies
      enemies.children.forEach((enemy) => {
        bullets.children.forEach((bullet) => {
          const dx = enemy.position.x + 16 - (bullet.position.x + 8);
          const dy = enemy.position.y + 16 - (bullet.position.y + 8);
          if (Math.sqrt(dx * dx + dy * dy) < 24) {
            bullet.dead = true;
            enemy.dead = true;
            scoreAmount += Math.floor(totalTime);
            score.update(dt, scoreAmount);
          }
        });

        // here we check if enemy reaches the city
        // if true, game is over
        if (enemy.position.x < 0) {
          if (!gameOver) {
            doGameOver();
          }
          enemy.dead = true;
          gameLoop.stop();
        }
      });

      // update function
      scene.update(dt);
    },
    () => {
      renderer.render(scene);
    }
  );

  gameLoop.start();
};
