import { TileSprite, Vector } from "../ares";
import PupsImageURL from "../images/pups.png";

class Pup extends TileSprite {
  constructor() {
    super({
      textureURL: PupsImageURL,
      tileW: 64,
      tileH: 64,
      frame: { x: 2, y: 0 },
      scale: new Vector(0.5, 0.5),
    });
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);

    // Fluctuate the position in the y direction
    const fluctuationSpeed = 20; // Adjust this value to control the speed of fluctuation
    const fluctuationRange = 1; // Adjust this value to control the range of fluctuation
    const yOffset = Math.sin(t * fluctuationSpeed) * fluctuationRange;
    this.position.y += yOffset;
  }
}

export default Pup;
