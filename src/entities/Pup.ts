import PupsImageURL from "../images/pups.png";
import { TileSprite, Vector, Cmath } from "../ares";
import { ShootingStrategy } from "../lib/ShootingStrategy";

class Pup extends TileSprite {
  private _payload: ShootingStrategy;

  constructor(position: Vector, shootingStrategy: ShootingStrategy) {
    super({
      textureURL: PupsImageURL,
      tileW: 64,
      tileH: 64,
      frame: { x: 2, y: 0 },
      scale: new Vector(1, 1),
      pivot: new Vector(32, 32),
      position,
      dead: false,
    });

    this._payload = shootingStrategy;
  }

  get hitbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  get payload(): ShootingStrategy {
    return this._payload;
  }

  public update(dt: number, t: number): void {
    this.angle += Cmath.deg2rad(2);
  }
}

export default Pup;
