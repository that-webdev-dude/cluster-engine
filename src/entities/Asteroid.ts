import { TileSprite, Vector, Cmath } from "../ares";
import AsteroidsImageURL from "../images/asteroids.png";

interface IAsteroidConfig {
  position: Vector;
  velocity: Vector;
  rotation: number;
  scale: number;
}

class Asteroid extends TileSprite {
  constructor() {
    super({
      textureURL: AsteroidsImageURL,
      tileW: 64,
      tileH: 64,
      frame: { x: 0, y: 0 },
    });
    this.pivot.set(32, 32);
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    // make the asteroid rotate slowly over time using Cmath, the dt parameter and this.angle property.
    // make sure to work in degrees through Cmath.rad2deg.
    this.angle += Cmath.rad2deg(dt * 0.01);
  }
}

export default Asteroid;
