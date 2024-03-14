import { TileSprite, Vector, Keyboard } from "../cluster";
import spritesheetImageURL from "../images/spritesheet.png";

export class Zombie extends TileSprite {
  constructor(position: Vector) {
    super({
      imageURL: spritesheetImageURL,
      position: position,
      velocity: new Vector(0, 0),
      tileWidth: 32,
      tileHeight: 32,
    });
    this.animation.add(
      "idle",
      [
        { x: 4, y: 1 },
        { x: 5, y: 1 },
      ],
      0.625
    );
    this.animation.play("idle");
  }

  public update(dt: number): void {
    super.update(dt);
  }
}
