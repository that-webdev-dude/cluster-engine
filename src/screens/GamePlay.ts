import { Container, Scene, Camera, Cmath, Vector, Entity } from "../ares";
import { EntityType } from "../ares/types";
import Background from "../entities/Background";
import Player from "../entities/Player";
import Pup from "../entities/Pup";

class GamePlay extends Scene {
  private _background: Background;
  private _bullets: Container;
  private _player: Player;
  private _camera: Camera;
  private _pup: Pup;

  constructor(game: any) {
    super(game);
    const { width, height } = game;
    const background = new Background({ width, height });
    const bullets = new Container();
    const player = new Player({ input: game.keyboard });
    const camera = new Camera({
      viewSize: { width, height },
      worldSize: { width, height },
    });
    const pup = new Pup(new Vector(400, 100));

    camera.add(background);
    camera.add(player);
    camera.add(bullets);
    camera.add(pup);
    this.add(camera);

    this._background = background;
    this._bullets = bullets;
    this._player = player;
    this._camera = camera;
    this._pup = pup;
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
      // this._camera.shake();
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

    // if (t > 10) {
    //   this._camera.add(new Pup(new Vector()));
    // }

    Entity.hit(this._player, this._pup, () => console.log("hit"));
  }
}

export default GamePlay;
