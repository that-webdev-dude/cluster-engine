import { Container, Scene, Camera, Cmath, Game, Vector, Entity } from "../ares";
import Background from "../entities/Background";
import Asteroid from "../entities/Asteroid";
import Bullet from "../entities/Bullet";
import Player from "../entities/Player";
import Dialog from "../dialogs/Dialog";
import Enemy from "../entities/Enemy";

// class GameOverDialog extends Dialog {
//   constructor() {
//     super({
//       width: 100,
//       height: 100,
//       onUpdate: () => {},
//       onClose: () => {},
//     });

//     this.add(
//       new Rect({
//         width: this.width,
//         height: this.height,
//         fill: "white",
//         alpha: 0.5,
//       })
//     );
//   }
// }

// const asteroidsPool = new Pool(() => new Asteroid(), 10);

class GamePlay extends Scene {
  private _background: Background;
  private _playerBullets: Container;
  private _enemyBullets: Container;
  private _asteroids: Container;
  private _enemies: Container;
  private _player: Player;
  private _camera: Camera;

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

    this._background = background;
    this._playerBullets = playerBullets;
    this._enemyBullets = enemyBullets;
    this._asteroids = asteroids;
    this._enemies = enemies;
    this._player = player;
    this._camera = camera;

    // const asteroid = asteroidsPool.next();
    // asteroids.add(asteroid);

    // this.add(new GameOverDialog());
    this._enemies.add(
      new Enemy({
        position: new Vector(width - 100, 100),
        reloadTimeMin: 0.5,
        reloadTimeMax: 3,
      })
    );
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    const { _player, _enemies, _playerBullets, _enemyBullets, game } = this;

    // player positioning
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

    // player shooting
    if (game.keyboard.action) {
      const playerBullets = _player.fire();
      if (playerBullets) {
        playerBullets.forEach((bullet) => {
          _playerBullets.add(bullet);
        });
      }
    }

    // bullets going offscreen are removed
    // this should include all the entities that are not player
    [..._playerBullets.children, ..._enemyBullets.children].forEach(
      (bullet) => {
        if (
          bullet.position.x > game.width ||
          bullet.position.x < 0 ||
          bullet.position.y > game.height ||
          bullet.position.y < 0
        ) {
          bullet.dead = true;
        }
      }
    );

    // the enemy shoots back
    _enemies.children.forEach((enemy) => {
      if (enemy instanceof Enemy) {
        const bullet = enemy.shoot(() => {
          /* do something */
        });
        if (bullet) {
          _enemyBullets.add(bullet);
        }
      }
    });

    // player-enemy collision
    _enemies.children.forEach((enemy) => {
      if (enemy instanceof Enemy) {
        Entity.hit(_player, enemy, () => {
          if (enemy instanceof Enemy) {
            _player.hit(1, () => {
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
                // this._camera.shake();
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

    // quit to main menu
    // if (this.game.keyboard.key("KeyQ")) {
    //   this.game.keyboard.active = false;
    //   this.transitions.toStart();
    // }

    // // go to win screen
    // if (this.game.keyboard.key("KeyW")) {
    //   this.game.keyboard.active = false;
    //   this.transitions.toEnd();
    // }

    // if (!this._pup.dead) {
    //   // this will always be true as the pup reference is never null
    //   // so we need to check if the pup is dead first
    //   Entity.hit(this._player, this._pup, () => {
    //     const payload = this._pup.payload;
    //     this._player.cannon.shootingStrategy = payload;
    //     this._camera.shake();
    //     this._pup.dead = true;
    //   });
    // }
  }
}

export default GamePlay;
