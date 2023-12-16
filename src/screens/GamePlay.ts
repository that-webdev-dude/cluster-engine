import { Container, Scene, Camera, Cmath } from "../ares";
import Background from "../entities/Background";
import Player from "../entities/Player";
import Bullet from "../entities/Bullet";

class GamePlay extends Scene {
  private _bullets: Container;
  private _player: Player;
  private _camera: Camera;

  constructor(game: any) {
    super(game);
    const { width, height } = game;
    const background = new Background({ width, height });
    const bullets = new Container();
    const player = new Player({ input: game.keyboard });
    const camera = new Camera({
      viewSize: { width, height },
      worldSize: { width, height },
      subject: player,
    });

    // camera.add(background);
    camera.add(bullets);
    camera.add(player);
    this.add(camera);

    this._bullets = bullets;
    this._player = player;
    this._camera = camera;
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    const { _player, game } = this;

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

    if (game.keyboard.action) {
      const bullets = _player.fire();
      if (bullets) {
        bullets.forEach((bullet) => {
          this._bullets.add(bullet);
        });
      }
    }

    this._bullets.children.forEach((bullet) => {
      if (
        bullet.position.x > game.width ||
        bullet.position.x < 0 ||
        bullet.position.y > game.height ||
        bullet.position.y < 0
      ) {
        if ("dead" in bullet) {
          bullet.dead = true;
        }
      }
    });
  }
}

export default GamePlay;
