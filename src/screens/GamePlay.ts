// prettier-ignore
import { 
  Container, 
  Camera, 
  Entity, 
  Scene, 
  Cmath,
  Game, 
  State,
} from "../ares";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";
import EnemySpawner from "../lib/EnemySpawner";
import Background from "../entities/Background";
import Player from "../entities/Player";
import LoadingDialog from "../dialogs/LoadingDialog";

enum STATES {
  load,
  play,
  pause,
  loose,
  win,
}

class GamePlay extends Scene {
  private _playerBullets: Container;
  private _enemyBullets: Container;
  private _enemies: Container;
  private _player: Player;
  private _camera: Camera;
  private _enemySpawner: EnemySpawner;
  private _state: State<STATES>;
  private _dialog: LoadingDialog | null;
  private _background: Background;

  constructor(
    game: Game,
    transitions?: {
      toStart?: () => void;
      toNext?: () => void;
      toEnd?: () => void;
    }
  ) {
    super(game, transitions);
    const { width, height } = game;
    const playerBullets = new Container();
    const enemyBullets = new Container();
    const background = new Background({ width, height });
    const enemies = new Container();
    const player = new Player({ input: game.keyboard });
    const camera = new Camera({
      worldSize: { width, height },
      viewSize: { width, height },
      subject: player,
    });

    this._playerBullets = playerBullets;
    this._enemyBullets = enemyBullets;
    this._background = background;
    this._enemies = enemies;
    this._player = player;
    this._camera = camera;
    this._state = new State(STATES.load);
    this._dialog = null;
    this._enemySpawner = new EnemySpawner(game, this._enemies);
    this._initialize();
  }

  private _initialize() {
    const { game } = this;
    const playerPosX = 100;
    const playerPosY = game.height / 2 - this._player.height / 2;
    this._player.position.set(playerPosX, playerPosY);
    this._player.active = false;
    this._camera.add(this._background);
    this._camera.add(this._player);
    this.add(this._camera);
  }

  private _play(dt: number, t: number) {
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

  update(dt: number, t: number) {
    super.update(dt, t);

    const { _state } = this;
    _state.update(dt);

    switch (_state.get()) {
      case STATES.load:
        if (_state.first) {
          const onDialogClose = () => {
            this._player.active = true;
            if (this._dialog) {
              this._dialog.dead = true;
              this._state.set(STATES.play);
            }
          };
          this._dialog = new LoadingDialog(onDialogClose);
          this._dialog.position.set(
            this.game.width / 2 - this._dialog.width / 2,
            this.game.height / 2 - this._dialog.height / 2
          );
          this._camera.add(this._dialog);
        }
        break;
      case STATES.play:
        if (_state.first) {
          this._camera.add(this._playerBullets);
          this._camera.add(this._enemyBullets);
          this._camera.add(this._enemies);
        }
        // do something
        this._play(dt, t);
        break;
      case STATES.pause:
        if (_state.first) {
          // do something
        }
        // do something
        break;
      case STATES.loose:
        if (_state.first) {
          // do something
        }
        // do something
        break;
      case STATES.win:
        if (_state.first) {
          // do something
        }
        // do something
        break;
      default:
        break;
    }
  }
}

export default GamePlay;
