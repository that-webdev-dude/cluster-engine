import ares from "../ares";
import PlayerImageURL from "../images/spritesheet.png";
import { KeyboardInput } from "../ares/input";
import Entity from "../ares/core/Entity";
import Flame from "./Flame";

const { Container, TileSprite, Vector, Cmath } = ares;

type Sizeable = {
  width: number;
  height: number;
};

type SizeableEntity = Entity & Sizeable;

class PLayer extends Container {
  private _input: KeyboardInput;
  private _ship: SizeableEntity;
  private _flame: Flame;
  private _speed: number;
  private _onFire = () => {};

  constructor(config: { input: KeyboardInput; onFire?: () => void }) {
    const { input, onFire } = config;
    super();
    this._input = input;
    this._speed = 200;
    this._onFire = onFire || (() => {});
    this._ship = new TileSprite({
      textureURL: PlayerImageURL,
      tileW: 32,
      tileH: 32,
      frame: { x: 1, y: 3 },
      angle: Cmath.deg2rad(90),
      pivot: new Vector(16, 16),
    });

    this._flame = new Flame();

    this.add(this._flame);
    this.add(this._ship);
    this.position.set(100, 100);
  }

  get width(): number {
    return this._ship.width;
  }

  get height(): number {
    return this._ship.height;
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    if (this._input.x) {
      this.position.x += this._speed * dt * this._input.x;
      if (
        this._input.x === 1 &&
        this._flame.animation.currentAnimationName === "idle"
      ) {
        this._flame.animation.play("thrust");
      }
    } else {
      this._flame.animation.play("idle");
    }

    if (this._input.y) {
      this.position.y += this._speed * dt * this._input.y;
    }
  }
}

export default PLayer;
