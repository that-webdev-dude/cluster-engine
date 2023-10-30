import Screen from "./Screen";
import cluster from "../cluster";

import backgroundImageURL from "../images/background.png";
import Background from "../entities/Background";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import Bullet from "../entities/Bullet";
import Vector from "../cluster/utils/Vector";

// prettier-ignore
const { 
  Container, 
  Texture, 
  Pool, 
  Text,
  Timer,
  entity, 
  math 
} = cluster;

class GamePlay extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);

    const backgroundTexture = new Texture(backgroundImageURL);
    const background = new Background({
      texture: backgroundTexture,
      displayW: game.width,
      displayH: game.height,
      velocity: new Vector(-100, 0),
    });
    const enemies = new Container();
    const bullets = new Container();
    const player = new Player(game, input);

    this.enemyPool = new Pool(() => new Enemy(), 20);
    this.bulletPool = new Pool(() => new Bullet(), 15);
    this.background = this.add(background);
    this.enemies = this.add(enemies);
    this.bullets = this.add(bullets);
    this.player = this.add(player);

    this.enemySpawnRate = 0.75;
    this.enemySpawnMax = 10;
    this.enemySpawnLast = 0;

    // UI ==================================================
    this.scoreText = this.add(
      new Text(`SCORES: ${this.globals.scores}`, {
        align: "left",
        fill: "white",
        font: '16px "Press Start 2P"',
      })
    );
    this.scoreText.position = new Vector(32, this.game.height - 48);

    this.livesText = this.add(
      new Text(`LIVES: ${this.globals.lives}`, {
        align: "left",
        fill: "white",
        font: '16px "Press Start 2P"',
      })
    );
    this.livesText.position = new Vector(32, this.game.height - 80);

    this.levelText = this.add(
      new Text(`LEVEL: ${this.globals.levelID}`, {
        align: "right",
        fill: "white",
        font: '16px "Press Start 2P"',
      })
    );
    this.levelText.position = new Vector(
      game.width - 32,
      this.game.height - 48
    );

    this.timerText = this.add(
      new Text(`${this.globals.timer.toFixed(2)}`, {
        align: "center",
        fill: "white",
        font: '24px "Press Start 2P"',
      })
    );
    this.timerText.position = new Vector(this.game.width / 2, 32);
    // UI ==================================================
  }

  /**
   * Spawns a bullet at the player's position.
   * @function
   * @memberof GamePlay
   * @returns {void}
   */
  spawnBullet() {
    let bullet = this.bullets.add(this.bulletPool.next());
    let { x, y } = entity.center(this.player);
    bullet.position.set(x - bullet.width / 2, y - bullet.height / 2);
  }

  /**
   * Spawns a new enemy on the game screen.
   * @function
   * @memberof GamePlay
   * @returns {void}
   */
  spawnEnemy() {
    let enemy = this.enemies.add(this.enemyPool.next());
    enemy.position.set(
      this.game.width - enemy.width,
      math.rand(100, this.game.height - enemy.height - 100)
    );
  }

  /**
   * Increments the score by 10.
   * @function
   * @memberof GamePlay
   * @returns {void}
   */
  score() {
    this.globals.scores += 10;
    this.scoreText.text = `SCORES: ${this.globals.scores}`;
  }

  /**
   * Decrements the timer by dt.
   * @function
   * @memberof GamePlay
   * @param {*} dt
   */
  countDown(dt) {
    this.globals.timer -= dt;
    if (this.globals.timer <= 0) {
      this.globals.timer = 20;
      this.timerText.text = ``;
      this.transitions.onLoose();
    } else {
      this.timerText.text = `${this.globals.timer.toFixed(2)}`;
    }
  }

  update(dt, t) {
    super.update(dt, t);

    // update the timer
    this.countDown(dt);

    // spawn enemies
    if (t - this.enemySpawnLast > this.enemySpawnRate) {
      this.enemySpawnLast = t;
      this.spawnEnemy();
    }

    // fire a bullet
    if (this.player.canFire) {
      this.spawnBullet();
    }

    // bullet out of bounds
    // bullet enemy collisions
    this.bullets.children.forEach((bullet) => {
      if (bullet.position.x > this.game.width + bullet.width) {
        bullet.dead = true;
      } else {
        this.enemies.children.forEach((enemy) => {
          entity.hit(bullet, enemy, () => {
            bullet.dead = true;
            enemy.dead = true;
            this.score();
          });
        });
      }
    });

    // enemy out of bounds
    this.enemies.children.forEach((enemy) => {
      if (enemy.position.x + enemy.width < 0) {
        enemy.dead = true;
        // increase the damage // GAME OVER
      } else {
        entity.hit(enemy, this.player, () => {
          enemy.dead = true;
          this.player.dead = true;
          this.transitions.onLoose();
        });
      }
    });
  }
}

export default GamePlay;
