import { Vector, Pool, Cmath } from "../ares";
import { Bullet } from "./Bullet";

// BULLET POOL
const bulletPool = new Pool(
  () =>
    new Bullet({
      damage: 1,
      frame: { x: 0, y: 0 },
      velocity: new Vector(500, 100),
      position: new Vector(0, 0),
      direction: 1,
    }),
  10
) as Pool<Bullet>;

// SHOOTING STRATEGY
interface IShootingStrategy {
  shoot(sourceCannon: Cannon): Bullet[];
}

class EnemyShootingStrategy implements IShootingStrategy {
  public shoot(sourceCannon: Cannon): Bullet[] {
    sourceCannon.reloadTime = Cmath.randf(2, 8);
    return [
      bulletPool.next((bullet) => {
        bullet.position.set(
          sourceCannon.position.x,
          sourceCannon.position.y - bullet.height / 2
        );
        // bullet.velocity.set(-200, 0);
        // bullet.damage = 1;
        // bullet.frame = { x: 3, y: 1 };
      }),
    ];
  }
}

class DefaultShootingStrategy implements IShootingStrategy {
  public shoot(cannon: Cannon): Bullet[] {
    cannon.reloadTime = 0.25;
    return [
      bulletPool.next((bulletInstance) => {
        bulletInstance.position.set(
          cannon.position.x,
          cannon.position.y - bulletInstance.height / 2
        );
        // bulletInstance.velocity.set(500, 0);
        // bulletInstance.damage = 1;
        // bulletInstance.frame = { x: 1, y: 1 };
      }),
    ];
  }
}

class DoubleShootingStrategy implements IShootingStrategy {
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
        // bullet.velocity.set(500, 0);
        // bullet.damage = 1;
        // bullet.frame = { x: 1, y: 0 };
      });
      return bullet;
    });
  }
}

// CANNON
type CannonConfig = {
  offset: Vector;
  position: Vector;
  shootingStrategy: IShootingStrategy;
};

class Cannon {
  private _shootingStrategy: IShootingStrategy;
  private _ownerPosition: Vector;
  private _position: Vector;
  private _offset: Vector;
  private _reloadTime: number;

  constructor(config: CannonConfig) {
    const { offset, position, shootingStrategy } = config;
    this._shootingStrategy = shootingStrategy;
    this._ownerPosition = position;
    this._position = new Vector();
    this._offset = new Vector(offset.x, offset.y);
    this._reloadTime = 0;
  }

  get ready(): boolean {
    return this._reloadTime <= 0 ? true : false;
  }

  get position(): Vector {
    return this._position;
  }

  set reloadTime(seconds: number) {
    this._reloadTime = seconds;
  }

  set shootingStrategy(strategy: IShootingStrategy) {
    this._shootingStrategy = strategy;
  }

  public fire(): Bullet[] | null {
    if (this.ready && this._shootingStrategy) {
      return this._shootingStrategy.shoot(this);
    } else {
      return null;
    }
  }

  public update(dt: number): void {
    this._position.set(
      this._ownerPosition.x + this._offset.x,
      this._ownerPosition.y + this._offset.y
    );
    this._reloadTime -= dt;
  }
}

export {
  Cannon,
  DefaultShootingStrategy,
  DoubleShootingStrategy,
  EnemyShootingStrategy,
};
