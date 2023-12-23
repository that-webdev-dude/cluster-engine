import { Container, Scene, Camera, Cmath, Pool, Game, Rect } from "../ares";
import Background from "../entities/Background";
import Asteroid from "../entities/Asteroid";
import Player from "../entities/Player";
import Dialog from "../dialogs/Dialog";

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
  private _asteroids: Container;
  private _bullets: Container;
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
    const asteroids = new Container();
    const bullets = new Container();
    const player = new Player({ input: game.keyboard });
    const camera = new Camera({
      viewSize: { width, height },
      worldSize: { width, height },
      subject: player,
    });

    camera.add(background);
    camera.add(asteroids);
    camera.add(bullets);
    camera.add(player);
    this.add(camera);

    this._background = background;
    this._asteroids = asteroids;
    this._bullets = bullets;
    this._player = player;
    this._camera = camera;

    // const asteroid = asteroidsPool.next();
    // asteroids.add(asteroid);

    // this.add(new GameOverDialog());
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    const { _player, _bullets, game } = this;

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
      const bullets = _player.fire();
      if (bullets) {
        bullets.forEach((bullet) => {
          _bullets.add(bullet);
        });
      }
    }

    // bullets rendering
    _bullets.children.forEach((bullet) => {
      if (
        bullet.position.x > game.width ||
        bullet.position.x < 0 ||
        bullet.position.y > game.height ||
        bullet.position.y < 0
      ) {
        bullet.dead = true;
      }
    });

    // quit to main menu
    if (this.game.keyboard.key("KeyQ")) {
      this.game.keyboard.active = false;
      this.transitions.toStart();
    }

    // go to win screen
    if (this.game.keyboard.key("KeyW")) {
      this.game.keyboard.active = false;
      this.transitions.toEnd();
    }

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
