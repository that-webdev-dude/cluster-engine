import { TileSprite, Vector } from "../ares";
import PupsImageURL from "../images/pups.png";
import { DoubleShootingStrategy } from "./Cannon";

class Pup extends TileSprite {
  private _payload: DoubleShootingStrategy;

  constructor(position: Vector) {
    super({
      textureURL: PupsImageURL,
      tileW: 64,
      tileH: 64,
      frame: { x: 2, y: 0 },
      scale: new Vector(0.5, 0.5),
      pivot: new Vector(32, 32),
      position,
      dead: false,
    });

    this._payload = new DoubleShootingStrategy();
  }

  get hitbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  get payload(): DoubleShootingStrategy {
    return this._payload;
  }

  public update(dt: number, t: number): void {
    // Fluctuate the position in the y direction
    const fluctuationSpeed = 20; // Adjust this value to control the speed of fluctuation
    const fluctuationRange = 1; // Adjust this value to control the range of fluctuation
    const yOffset = Math.sin(t * fluctuationSpeed) * fluctuationRange;
    this.position.y += yOffset;
    this.angle += dt * 2;
  }
}

export default Pup;
