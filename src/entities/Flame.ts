import { TileSprite, Vector, Cmath } from "../ares";
import flameImageURL from "../images/flame.png";

class Flame extends TileSprite {
  constructor() {
    super({
      textureURL: flameImageURL,
      tileW: 32,
      tileH: 50,
      frame: { x: 0, y: 0 },
      scale: new Vector(0.5, 0.25),
      position: new Vector(-20, 20),
      angle: Cmath.deg2rad(270),
      alpha: 0.75,
    });

    this.animation.add(
      "idle",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
      0.1
    );

    this.animation.add(
      "thrust",
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 3 },
      ],
      0.035,
      () => {
        this.animation.play("burn");
      }
    );

    this.animation.add(
      "burn",
      [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 0, y: 4 },
        { x: 1, y: 4 },
        { x: 0, y: 3 },
        { x: 1, y: 3 },
      ],
      0.05
    );

    this.animation.play("idle");
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
  }
}

export default Flame;
