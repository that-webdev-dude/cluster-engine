import { TileSprite, Vector, Cmath } from "../ares";
import EnemiesImageURL from "../images/enemies.png";
import Bullet from "./Bullet";

interface IEnemyConfig {
  reloadTimeMin?: number;
  reloadTimeMax?: number;
  position?: Vector;
  health?: number;
}

class Enemy extends TileSprite {
  private _reloadTimeMin: number;
  private _reloadTimeMax: number;
  private _reloadTime: number;
  velocity: Vector;
  health: number;

  constructor({
    reloadTimeMin = 0,
    reloadTimeMax = 0,
    position = new Vector(100, 10),
    health = 10,
  }: IEnemyConfig) {
    super({
      dead: false,
      tileW: 64,
      tileH: 64,
      frame: { x: 2, y: 3 },
      textureURL: EnemiesImageURL,
      position,
    });
    this._reloadTimeMin = reloadTimeMin; // in milliseconds
    this._reloadTimeMax = reloadTimeMax; // in milliseconds
    this._reloadTime = Cmath.rand(reloadTimeMin, reloadTimeMax); // in milliseconds
    this.velocity = new Vector(0, 0);
    this.health = health;
  }

  get hitbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  get canShoot(): boolean {
    return this._reloadTimeMax > 0 && this._reloadTimeMax > this._reloadTimeMin;
  }

  public shoot(onShoot: () => void): Bullet | null {
    if (this.canShoot && this._reloadTime <= 0) {
      this._reloadTime = Cmath.randf(this._reloadTimeMin, this._reloadTimeMax);
      onShoot();
      return new Bullet({
        damage: 1,
        frame: { x: 2, y: 0 },
        velocity: new Vector(-100, 0),
        position: new Vector(this.position.x, this.position.y + 32 - 6),
      });
    }
    return null;
  }

  public hit(damage: number, onHit: () => void = () => {}) {
    this.health -= damage;
    onHit();
  }

  public die(onDie: () => void) {
    this.dead = true;
    onDie();
  }

  public update(dt: number, t: number) {
    super.update(dt, t);
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    if (!this.health) {
      this.dead = true;
    }

    this._reloadTime -= dt;
    //     if (this._reloadTime <= 0) {
    //       this._reloadTime = 0;
    //     }
  }
}

export default Enemy;
