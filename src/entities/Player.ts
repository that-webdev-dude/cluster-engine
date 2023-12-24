import { Cmath, Container, Keyboard, Vector } from "../ares";
import Ship from "./Ship";
import Bullet from "./Bullet";
import {
  Cannon,
  // DefaultShootingStrategy,
  // DoubleShootingStrategy,
  // TripleShootingStrategy,
} from "./Cannon";

const MAX_HEALTH = 4;
const MAX_LIVES = 3;
const INVINCIBILITY_TIME = 3;

class Player extends Container {
  private _input: Keyboard;
  private _cannon: Cannon;
  private _ship: Ship;
  private _speed: number;
  private _invincibility: number;
  public health: number;
  public lives: number;

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

    this._invincibility = INVINCIBILITY_TIME;
    this.health = MAX_HEALTH;
    this.lives = MAX_LIVES;

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

  get invincible(): boolean {
    return this._invincibility > 0;
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

  public hit(damage: number, onHit: () => void = () => {}) {
    if (!this.invincible) {
      this._invincibility = INVINCIBILITY_TIME;
      this.health -= damage;
    }
    onHit();
  }

  public die(onDie: () => void) {
    if (this.health <= 0) {
      this.health = MAX_HEALTH;
      this.lives--;
    }
    onDie();
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

    this._invincibility -= dt;
    if (this._invincibility > 0) {
      this._ship.alpha = Math.floor(this._invincibility * 10) % 2 === 0 ? 0 : 1;
    } else {
      this._ship.alpha = 1;
    }
  }
}

export default Player;
