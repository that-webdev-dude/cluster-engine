import { TileSprite, Vector, Cmath } from "../ares";
import ExplosionImageURL from "../images/explosion.png";

class Explosion extends TileSprite {
  constructor(position: Vector) {
    super({
      textureURL: ExplosionImageURL,
      tileW: 64,
      tileH: 64,
      frame: { x: 0, y: 0 },
    });
    this.animation.add(
      "explode",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
        { x: 6, y: 0 },
      ],
      0.075,
      () => {
        this.dead = true;
      }
    );
    let scaleValue = Cmath.randf(1, 2);
    this.scale.set(scaleValue, scaleValue);
    this.position.copy(position);
    this.animation.play("explode");
  }
}

export default Explosion;
