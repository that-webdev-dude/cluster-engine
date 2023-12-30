import { seconds, Positionable } from "../ares/types";
import { Vector, Pool } from "../ares";
import { Bullet } from "../entities/Bullet";
import { ShootingStrategy, DefaultShootingStrategy } from "./ShootingStrategy";

interface ICannonConfig {
  offset: Vector;
  owner: Positionable;
  pool: Pool<Bullet>;
  shootingStrategy?: ShootingStrategy;
}

class Cannon {
  private readonly _offset: Vector;
  private readonly _owner: Positionable;
  private _timer: seconds;
  private _shootingStrategy: ShootingStrategy;
  public pool: Pool<Bullet>;

  constructor(config: ICannonConfig) {
    const { offset, owner, pool, shootingStrategy } = config;
    this._shootingStrategy = shootingStrategy || new DefaultShootingStrategy();
    this._timer = this._shootingStrategy.reloadTime;
    this._owner = owner;
    this._offset = offset;
    this.pool = pool;
  }

  get position(): Vector {
    return this._owner.position.clone().add(this._offset);
  }

  get ready(): boolean {
    return this._timer <= 0;
  }

  private _reload(): void {
    this._timer = this._shootingStrategy.reloadTime;
  }

  set shootingStrategy(strategy: ShootingStrategy) {
    this._shootingStrategy = strategy;
  }

  public fire(): Bullet[] | null {
    if (this.ready) {
      this._reload();
      return this._shootingStrategy.shoot(this);
    }
    return null;
  }

  public update(dt: seconds) {
    this._timer -= dt;
  }
}

export { Cannon };
