import { Container, Keyboard, Vector } from "../ares";
import Ship from "./Ship";
import Bullet from "./Bullet";
import {
  Cannon,
  // DefaultShootingStrategy,
  // DoubleShootingStrategy,
  // TripleShootingStrategy,
} from "./Cannon";

class Player extends Container {
  private _input: Keyboard;
  private _cannon: Cannon;
  private _ship: Ship;
  private _speed: number;

  constructor(config: { input: Keyboard }) {
    const { input } = config;
    super();
    this._input = input;
    this._speed = 200;
    this._ship = new Ship(this);
    this._cannon = new Cannon({
      position: this.position,
      offset: new Vector(32, 16),
    });

    this.add(this._ship);

    this.position.set(100, 100);
  }

  get width(): number {
    return this._ship.width;
  }

  get height(): number {
    return this._ship.height;
  }

  get cannon(): Cannon {
    return this._cannon;
  }

  get ship(): Ship {
    return this._ship;
  }

  get hitbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  public fire(): Bullet[] | null {
    return this._cannon.ready ? this._cannon.fire() : null;
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);

    if (this._input.x) {
      this.position.x += this._speed * dt * this._input.x;
    }
    if (this._input.y) {
      this.position.y += this._speed * dt * this._input.y;
    }

    // if (this.position.x > 250) {
    //   this._cannon.shootingStrategy = DoubleShootingStrategy;
    // } else {
    //   this._cannon.shootingStrategy = DefaultShootingStrategy;
    // }

    this._cannon.update(dt);
  }
}

export default Player;
