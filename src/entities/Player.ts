import { KeyboardInput } from "../ares/input";
import spritesheetImageURL from "../images/spritesheet.png";
import ares from "../ares";

const { TileSprite, Cmath, Vector } = ares;

class Player extends TileSprite {
  private _input: KeyboardInput;
  private _speed: number;
  private _fireInterval: number;
  private _timeSinceLastShot: number;
  private _onFire = () => {};

  constructor(config: { input: KeyboardInput; onFire?: () => void }) {
    const { input, onFire } = config;
    super({
      textureURL: spritesheetImageURL,
      tileW: 32,
      tileH: 32,
      frame: { x: 1, y: 3 },
      angle: Cmath.deg2rad(90),
      pivot: new Vector(16, 16),
    });

    this._input = input;
    this._speed = 200;
    this._fireInterval = 0.125;
    this._timeSinceLastShot = 0;
    this._onFire = onFire || (() => {});
  }

  public fire(): void {
    // play fire sound?
    this._onFire();
  }

  public update(dt: number, t: number): void {
    if (this._input.x) {
      this.position.x += this._speed * dt * this._input.x;
    }

    if (this._input.y) {
      this.position.y += this._speed * dt * this._input.y;
    }

    if (this._input.action) {
      if (this._timeSinceLastShot <= 0) {
        this.fire();
        this._timeSinceLastShot = this._fireInterval;
      } else {
        this._timeSinceLastShot -= dt;
      }
    } else {
      this._timeSinceLastShot = 0;
    }
  }
}

export default Player;
