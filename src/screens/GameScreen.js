import Screen from "./Screen";
import cluster from "../cluster";

// background
import backgroundImageURL from "../images/background.png";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import Bullet from "../entities/Bullet";
import Background from "../entities/Background";

const { Texture, Sprite, Container, Pool, entity, math } = cluster;

class GameScreen extends Screen {
  constructor(game, input) {
    super(game, input);

    const backgroundTexture = new Texture(backgroundImageURL);
    const background = new Background(backgroundTexture, game, 50);
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
  }

  /**
   * Spawns a bullet at the player's position.
   * @function
   * @memberof GameScreen
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
   * @memberof GameScreen
   * @returns {void}
   */
  spawnEnemy() {
    let enemy = this.enemies.add(this.enemyPool.next());
    enemy.position.set(
      this.game.width - enemy.width,
      math.rand(100, this.game.height - enemy.height - 100)
    );
  }

  update(dt, t) {
    super.update(dt, t);
    if (t - this.enemySpawnLast > this.enemySpawnRate) {
      this.enemySpawnLast = t;
      this.spawnEnemy();
    }

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
          });
        });
      }
    });

    // enemy out of bounds
    this.enemies.children.forEach((enemy) => {
      if (enemy.position.x + enemy.width < 0) {
        enemy.dead = true;
        // GAME OVER
      } else {
        entity.hit(enemy, this.player, () => {
          enemy.dead = true;
          // GAME OVER
        });
      }
    });
  }
}

export default GameScreen;
