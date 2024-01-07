import { Container, Camera, Vector, Entity, Scene, Cmath, Game } from "../ares";
import { Enemy, EnemyFrame, CurvedMovement } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";
import Background from "../entities/Background";
import Player from "../entities/Player";
import EnemySpawner from "../lib/EnemySpawner";

class GamePlay extends Scene {
  private _playerBullets: Container;
  private _enemyBullets: Container;
  private _enemies: Container;
  private _player: Player;
  private _camera: Camera;
  private _enemySpawner: EnemySpawner;

  constructor(
    game: Game,
    transitions?: {
      toNext?: () => void;
      toStart?: () => void;
      toEnd?: () => void;
    }
  ) {
    super(game, transitions);
    const { width, height } = game;
    const background = new Background({ width, height });
    const playerBullets = new Container();
    const enemyBullets = new Container();
    const asteroids = new Container();
    const enemies = new Container();
    const player = new Player({ input: game.keyboard });
    const camera = new Camera({
      viewSize: { width, height },
      worldSize: { width, height },
      subject: player,
    });

    camera.add(background);
    camera.add(playerBullets);
    camera.add(enemyBullets);
    camera.add(asteroids);
    camera.add(enemies);
    camera.add(player);
    this.add(camera);

    this._playerBullets = playerBullets;
    this._enemyBullets = enemyBullets;
    this._enemies = enemies;
    this._player = player;
    this._camera = camera;

    this._enemySpawner = new EnemySpawner(game, this._enemies);
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    const { _player, _enemies, _playerBullets, _enemyBullets, game } = this;

    // Update the enemy spawner
    this._enemySpawner.update(dt, t);

    // clamping the player position to the screen size
    // so it doesn't go offscreen
    _player.position.x = Cmath.clamp(
      _player.position.x,
      24,
      game.width - _player.width
    );
    _player.position.y = Cmath.clamp(
      _player.position.y,
      0,
      game.height - _player.height
    );

    // player shooting logic goes here
    // the player should return an array of bullets
    // or null if no bullets are fired
    if (game.keyboard.action) {
      const playerBullets = _player.fire();
      if (playerBullets) {
        playerBullets.forEach((bullet) => {
          _playerBullets.add(bullet);
        });
      }
    }

    // all the bullets going offscreen are removed
    // this should include all the entities that are not player
    [..._playerBullets.children, ..._enemyBullets.children].forEach(
      (entity) => {
        if (
          entity.position.x > game.width ||
          entity.position.x < 0 ||
          entity.position.y > game.height ||
          entity.position.y < 0
        ) {
          entity.dead = true;
        }
      }
    );
    [..._enemies.children].forEach((enemy) => {
      if (enemy instanceof Enemy) {
        if (enemy.position.x + enemy.width < 0) {
          enemy.dead = true;
        }
      }
    });

    // the enemy shoots back
    // console.log(_enemies.children);
    _enemies.children.forEach((enemy) => {
      if (enemy instanceof Enemy) {
        const enemyBullets = enemy.fire();
        if (enemyBullets) {
          enemyBullets.forEach((bullet) => {
            _enemyBullets.add(bullet);
          });
        }
      }
    });

    // player-enemy collision
    _enemies.children.forEach((enemy) => {
      if (enemy instanceof Enemy) {
        Entity.hit(_player, enemy, () => {
          if (enemy instanceof Enemy) {
            _player.hit(1, () => {
              this._camera.shake();
              /* do something */
            });
            enemy.die(() => {
              /* do something */
            });
          }
        });
      }
    });

    // player-enemyBullet collision
    _enemyBullets.children.forEach((bullet) => {
      Entity.hit(_player, bullet, () => {
        if (bullet instanceof Bullet) {
          bullet.dead = true;
          _player.hit(bullet.damage, () => {
            this._camera.shake();
            /* do something */
          });
        }
      });
    });

    // playerBullet-enemy collision
    _playerBullets.children.forEach((bullet) => {
      _enemies.children.forEach((enemy) => {
        Entity.hit(bullet, enemy, () => {
          if (enemy instanceof Enemy && bullet instanceof Bullet) {
            bullet.dead = true;
            enemy.hit(bullet.damage, () => {
              /* do something */
            });
            if (enemy.health <= 0) {
              enemy.die(() => {
                /* do something */
              });
            }
          }
        });
      });
    });

    // player dies with zero-health
    if (_player.health <= 0) {
      _player.die(() => {
        _player.position.set(100, game.height / 2 - _player.height / 2);
      });
    }

    // player with no more lives
    // GAME OVER
  }
}

export default GamePlay;
