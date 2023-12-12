import Bullet from "./Bullet";
import Vector from "../ares/tools/Vector";

enum CannonType {
  default, // 1 cannon
  double, // 2 cannons
  triple, // 3 cannons
}

const cannonTypes = {
  [CannonType.default]: {
    fireRate: 10,
    fire: (cannonCtx: Cannon): Bullet[] => {
      const positions = [
        new Vector(cannonCtx.position.x + 30, cannonCtx.position.y + 14),
      ];
      const bullets = positions.map((position) => {
        const bullet = new Bullet(position);
        return bullet;
      });
      return bullets;
    },
  },
  [CannonType.double]: {
    fireRate: 0.1,
    fire: (cannonCtx: Cannon): Bullet[] => {
      return [];
    },
  },
  [CannonType.triple]: {
    fireRate: 0.1,
    fire: (cannonCtx: Cannon): Bullet[] => {
      return [];
    },
  },
};

class Cannon {
  private _reloadTime: number;
  readonly position: Vector;
  readonly cannonType: CannonType;

  constructor(position: Vector, cannonType: CannonType = CannonType.default) {
    this._reloadTime = 0;
    this.cannonType = cannonType;
    this.position = position;
  }

  get ready(): boolean {
    return this._reloadTime <= 0;
  }

  public fire(): Bullet[] | null {
    if (this.ready) {
      const { fireRate, fire } = cannonTypes[this.cannonType];
      this._reloadTime = 1 / fireRate;
      return fire(this);
    }
    return null;
  }

  public update(dt: number): void {
    this._reloadTime -= dt;
  }
}

export default Cannon;
