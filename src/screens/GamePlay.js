import Screen from "./Screen";
import cluster from "../cluster";

import backgroundImageURL from "../images/background.png";
import Background from "../entities/Background";
import Explosion from "../entities/Explosion";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import Bullet from "../entities/Bullet";
import DialogPause from "../dialogs/DialogPause";

// prettier-ignore
const { 
  Container, 
  Texture, 
  Vector,
  State,
  Pool, 
  Text,
  math, 
  entity, 
} = cluster;

const states = {
  PLAYING: 0,
  PAUSED: 1,
};

class GamePlay extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);

    const player = new Player(game, input);
    const bullets = new Container();
    const enemies = new Container();
    const explosions = new Container();
    const backgroundTexture = new Texture(backgroundImageURL);
    const background = new Background({
      texture: backgroundTexture,
      displayW: game.width,
      displayH: game.height,
      velocity: new Vector(-100, 0),
    });

    this.state = new State(states.PLAYING);

    this.enemyPool = new Pool(() => new Enemy(), 20);
    this.bulletPool = new Pool(() => new Bullet(), 15);
    this.explosionPool = new Pool(() => new Explosion(), 10);

    this.background = this.add(background);
    this.explosions = this.add(explosions);
    this.enemies = this.add(enemies);
    this.bullets = this.add(bullets);
    this.player = this.add(player);
    this.dialog = null;
    this.enemySpawnMax = 10;
    this.enemySpawnLast = 0;
    this.enemySpawnRate = 0.75;

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
    let { x, y } = entity.center(this.player);
    for (let i = -8; i <= 16; i += 16) {
      let bullet = this.bullets.add(this.bulletPool.next());
      bullet.position.set(x - bullet.width / 2, y - bullet.height / 2 + i);
    }
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
   * Spawns an explosion at the given position.
   * @function
   * @memberof GamePlay
   * @param {number} x - The x position of the explosion.
   * @param {number} y - The y position of the explosion.
   * @returns {void}
   */
  spawnExplosion(x, y) {
    let explosion = this.explosions.add(this.explosionPool.next());
    explosion.position.set(x, y);
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

  /**
   * updates the gameplay.
   * @function
   * @memberof GamePlay
   * @param {*} dt
   * @param {*} t
   */
  updateGameplay(dt, t) {
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
            this.spawnExplosion(enemy.position.x - 16, enemy.position.y - 16);
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

  /**
   * updates the gameplay state.
   * @function
   * @memberof GamePlay
   * @param {*} dt
   * @param {*} t
   */
  update(dt, t) {
    const { state, input, game } = this;
    state.update(dt, t);
    switch (state.get()) {
      case states.PLAYING:
        this.updateGameplay(dt, t);
        break;
      case states.PAUSED:
        if (state.first) {
          this.dialog = this.add(
            new DialogPause(
              game.width,
              game.height,
              () => {
                if (state.is([states.PAUSED]) && input.keys.key("KeyP")) {
                  input.keys.reset();
                  this.dialog.close();
                }
              },
              () => {
                state.set(states.PLAYING);
              }
            )
          );
        }
        this.dialog.update(dt, t);
        break;
    }

    if (!state.is([states.PAUSED]) && input.keys.key("KeyP")) {
      state.set(states.PAUSED);
      input.keys.reset();
    }
  }
}

export default GamePlay;
