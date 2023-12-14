import { Container, Keyboard } from "../ares";
import Ship from "./Ship";
import Bullet from "./Bullet";
import Cannon from "./Cannon";

class PLayer extends Container {
  private _input: Keyboard;
  private _cannon: Cannon;
  private _ship: Ship;
  private _speed: number;

  constructor(config: { input: Keyboard }) {
    const { input } = config;
    super();
    this._input = input;
    this._speed = 200;
    this._ship = new Ship();
    this._cannon = new Cannon();

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
    }
    if (this._input.y) {
      this.position.y += this._speed * dt * this._input.y;
    }

    this._cannon.update(dt);
  }
}

export default PLayer;
