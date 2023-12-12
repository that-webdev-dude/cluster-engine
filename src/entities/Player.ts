import ares from "../ares";
import { KeyboardInput } from "../ares/input";
import Flame from "./Flame";
import Ship from "./Ship";
import Bullet from "./Bullet";
import Cannon from "./Cannon";
import Vector from "../ares/tools/Vector";
const { Container } = ares;

class PLayer extends Container {
  private _input: KeyboardInput;
  private _cannon: Cannon;
  private _ship: Ship;
  private _flame: Flame;
  private _speed: number;

  constructor(config: { input: KeyboardInput }) {
    const { input } = config;
    super();
    this._input = input;
    this._ship = new Ship();
    this._flame = new Flame();
    this._cannon = new Cannon(this.position);
    this._speed = 200;

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

  public fire(done: () => void): Bullet[] | null {
    if (this._cannon.ready) {
      const bullets = this._cannon.fire();
      done();
      return bullets;
    }
    return null;
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

    this._cannon.update(dt);
  }
}

export default PLayer;
