import { Container, Keyboard, Gamepad, Vector, Pool } from "../ares";
import { Bullet } from "./Bullet";
import { Cannon } from "../lib/Cannon";
import Ship from "./Ship";

const MAX_HEALTH = 4;
const MAX_LIVES = 3;
const INVINCIBILITY_TIME = 1;

const bulletPool = new Pool<Bullet>(() => new Bullet({}));

class Player extends Container {
  private _inputKeyboard: Keyboard;
  private _inputGamepad: Gamepad | null;
  private _cannon: Cannon;
  private _ship: Ship;
  private _speed: number;
  private _invincibility: number;
  public health: number;
  public lives: number;
  public active: Boolean;

  constructor(config: {
    inputKeyboard: Keyboard;
    inputGamepad?: Gamepad;
    lives: number;
  }) {
    const { inputKeyboard, inputGamepad, lives } = config;
    super();
    this._inputKeyboard = inputKeyboard;
    this._inputGamepad = inputGamepad || null;
    this._speed = 200;
    this._ship = new Ship(this);
    this._cannon = new Cannon({
      offset: new Vector(this.width, this.height / 2 - 6),
      owner: this,
      pool: bulletPool,
    });

    this._invincibility = INVINCIBILITY_TIME;
    this.health = MAX_HEALTH;
    this.lives = lives;
    this.active = false;

    this.add(this._ship);

    this.position.set(100, 100);
  }

  get invincible(): boolean {
    return this._invincibility > 0;
  }

  get width(): number {
    return this._ship.width;
  }

  get height(): number {
    return this._ship.height;
  }

  get ship(): Ship {
    return this._ship;
  }

  get cannon(): Cannon {
    return this._cannon;
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

    if (this.active) {
      if (this._inputKeyboard.x) {
        this.position.x += this._speed * dt * this._inputKeyboard.x;
      }
      if (this._inputKeyboard.y) {
        this.position.y += this._speed * dt * this._inputKeyboard.y;
      }

      if (this._inputGamepad) {
        this.position.x += this._speed * dt * this._inputGamepad.x;
        this.position.y += this._speed * dt * this._inputGamepad.y;
      }

      this._cannon.update(dt);

      this._invincibility -= dt;
      if (this._invincibility > 0) {
        this._ship.alpha =
          Math.floor(this._invincibility * 10) % 2 === 0 ? 0 : 1;
      } else {
        this._ship.alpha = 1;
      }
    }
  }
}

export default Player;
