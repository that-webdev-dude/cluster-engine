import { Vector, Pool } from "../ares";
import Bullet from "./Bullet";

abstract class ShootingStrategy {
  // protected _cannon: Cannon;
  // constructor(cannon: Cannon) {
  //   this._cannon = cannon;
  // }

  abstract shoot(sourceCannon: Cannon): Bullet[];
}

class DefaultShootingStrategy extends ShootingStrategy {
  public shoot(sourceCannon: Cannon): Bullet[] {
    sourceCannon.reloadTime = 0.25;
    return [
      bulletPool.next((bullet) => {
        bullet.position.set(
          sourceCannon.position.x,
          sourceCannon.position.y - bullet.height / 2
        );
        bullet.velocity.set(500, 0);
        bullet.damage = 1;
        bullet.frame = { x: 1, y: 1 };
      }),
    ];
  }
}

class DoubleShootingStrategy extends ShootingStrategy {
  public shoot(sourceCannon: Cannon): Bullet[] {
    sourceCannon.reloadTime = 0.125;
    const offsets = [
      { x: -4, y: -12 },
      { x: -4, y: 12 },
    ];
    return offsets.map((offset) => {
      const bullet = bulletPool.next((bullet) => {
        bullet.position.set(
          sourceCannon.position.x + offset.x,
          sourceCannon.position.y + offset.y - bullet.height / 2
        );
        bullet.velocity.set(500, 0);
        bullet.damage = 1;
        bullet.frame = { x: 1, y: 0 };
      });
      return bullet;
    });
  }
}

// class TripleShootingStrategy extends ShootingStrategy {
//   public shoot(): Bullet[] {
//     // Implement triple shooting logic here
//     return [];
//   }
// }

// BULLET POOL
const bulletPool = new Pool(
  () =>
    new Bullet({
      velocity: new Vector(500, 100),
      position: new Vector(0, 0),
      damage: 1,
      frame: { x: 0, y: 0 },
    }),
  10
) as Pool<Bullet>;

// CANNON
type CannonConfig = {
  offset: Vector;
  position: Vector;
};

class Cannon {
  private _parentPosition: Vector;
  private _offset: Vector;
  private _position: Vector;
  private _reloadTime: number;
  private _shootingStrategy: ShootingStrategy;

  constructor(config: CannonConfig) {
    const { offset, position } = config;
    this._shootingStrategy = new DefaultShootingStrategy();
    this._position = new Vector();
    this._offset = new Vector(offset.x, offset.y);
    this._reloadTime = 0;
    this._parentPosition = position;
  }

  get ready(): boolean {
    return this._reloadTime <= 0;
  }

  get position(): Vector {
    return this._position;
  }

  set reloadTime(seconds: number) {
    this._reloadTime = seconds;
  }

  set shootingStrategy(strategy: ShootingStrategy) {
    this._shootingStrategy = strategy;
  }

  public fire(): Bullet[] | null {
    if (this.ready) {
      return this._shootingStrategy.shoot(this);
    } else {
      return null;
    }
  }

  public update(dt: number): void {
    this._position.set(
      this._parentPosition.x + this._offset.x,
      this._parentPosition.y + this._offset.y
    );
    this._reloadTime -= dt;
  }
}

export {
  Cannon,
  ShootingStrategy,
  DefaultShootingStrategy,
  DoubleShootingStrategy,
  // TripleShootingStrategy,
};
