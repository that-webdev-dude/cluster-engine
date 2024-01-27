import EnemiesImageURL from "../images/enemies.png";
import { TileSprite, Vector, Pool, Cmath } from "../ares";
import { Cannon } from "../lib/Cannon";
import { ShootingStrategy } from "../lib/ShootingStrategy";
import { Bullet, BulletFrame } from "./Bullet";

type seconds = number;

class EnemyShootingStrategy extends ShootingStrategy {
  private static readonly RELOAD_TIME: seconds = 0.25;

  get reloadTime(): number {
    return Cmath.randf(0.5, 2);
  }

  public shoot(cannon: Cannon): Bullet[] {
    const bullet = cannon.pool.next((b) => {
      b.reset({
        position: cannon.position.clone(),
      });
    });
    return [bullet];
  }
}

const bulletPool = new Pool<Bullet>(
  () =>
    new Bullet({
      frame: { x: 1, y: 0 },
      direction: -1,
    })
);

const shootingStrategies = [new EnemyShootingStrategy()];

interface IMovementStrategy {
  move(position: Vector, dt: number): void;
}

class LinearMovement implements IMovementStrategy {
  private _velocity: Vector;

  constructor(velocity: Vector) {
    this._velocity = velocity;
  }

  move(position: Vector, dt: number): void {
    position.set(
      position.x + this._velocity.x * dt,
      position.y + this._velocity.y * dt
    );
  }
}

class CurvedMovement implements IMovementStrategy {
  private _velocity: Vector;
  private _amplitude: number;
  private _frequency: number;
  private _phase: number;
  private _time: number;

  constructor(
    velocity: Vector,
    amplitude: number,
    frequency: number,
    phase: number = 0
  ) {
    this._velocity = velocity;
    this._amplitude = amplitude;
    this._frequency = frequency;
    this._phase = phase;
    this._time = 0;
  }

  move(position: Vector, dt: number): void {
    this._time += dt;
    position.set(
      position.x + this._velocity.x * dt,
      position.y +
        Math.sin(this._time * this._frequency + this._phase) * this._amplitude
    );
  }
}

interface IEnemyFrame {
  x: number;
  y: number;
}

class EnemyFrame {
  public static get RED1(): IEnemyFrame {
    return { x: 0, y: 3 };
  }

  public static get RED2(): IEnemyFrame {
    return { x: 1, y: 3 };
  }

  public static get RED3(): IEnemyFrame {
    return { x: 2, y: 3 };
  }

  public static get RED4(): IEnemyFrame {
    return { x: 3, y: 3 };
  }

  public static get RED5(): IEnemyFrame {
    return { x: 4, y: 3 };
  }

  public static get RED6(): IEnemyFrame {
    return { x: 5, y: 3 };
  }

  public static get VENOM1(): IEnemyFrame {
    return { x: 0, y: 0 };
  }

  public static get VENOM2(): IEnemyFrame {
    return { x: 1, y: 0 };
  }

  public static get VENOM3(): IEnemyFrame {
    return { x: 2, y: 0 };
  }

  public static get VENOM4(): IEnemyFrame {
    return { x: 3, y: 0 };
  }

  public static get VENOM5(): IEnemyFrame {
    return { x: 4, y: 0 };
  }

  public static get VENOM6(): IEnemyFrame {
    return { x: 5, y: 0 };
  }
}

interface IEnemyConfig {
  movement: IMovementStrategy;
  frame: { x: number; y: number };
  health?: number;
  cannon?: boolean;
  position?: Vector;
}

class Enemy extends TileSprite {
  public static HEIGHT = 64;
  public static WIDTH = 64;

  private _movement: IMovementStrategy;
  private _cannon: Cannon | null;
  private _health: number;

  constructor({
    position = new Vector(0, 0),
    health = 1,
    movement,
    cannon,
    frame,
  }: IEnemyConfig) {
    super({
      position,
      tileW: 64,
      tileH: 64,
      frame: frame || { x: 2, y: 3 },
      textureURL: EnemiesImageURL,
    });
    this._movement = movement;
    this._health = health;
    this._cannon = cannon
      ? new Cannon({
          offset: new Vector(0, this.height / 2 - 6),
          owner: this,
          pool: bulletPool,
          shootingStrategy: shootingStrategies[0],
        })
      : null;
  }

  get hitbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  get health(): number {
    return this._health;
  }

  public fire(): Bullet[] | null {
    if (this._cannon && this._cannon.ready) {
      return this._cannon.fire();
    } else {
      return null;
    }
  }

  public hit(damage: number, onHit: () => void = () => {}) {
    this._health -= damage;
    onHit();
  }

  public die(onDie: () => void) {
    this.dead = true;
    onDie();
  }

  public update(dt: number, t: number): void {
    this._movement.move(this.position, dt);
    if (this._cannon) {
      this._cannon.update(dt);
    }
    if (!this._health) {
      this.dead = true;
    }
  }
}

export { Enemy, EnemyFrame, LinearMovement, CurvedMovement };
