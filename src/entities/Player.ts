import { TileSprite, Vector, Keyboard } from "../cluster";
import spritesheetImageURL from "../images/spritesheet.png";

export class Player extends TileSprite {
  keyboard: Keyboard;

  constructor(position: Vector, keyboard: Keyboard) {
    super({
      imageURL: spritesheetImageURL,
      position: position,
      tileWidth: 32,
      tileHeight: 32,
    });
    this.keyboard = keyboard;
    this.animation.add(
      "idle",
      [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      0.25
    );
    this.animation.play("idle");
  }

  public update(dt: number): void {
    super.update(dt);
    const { keyboard } = this;

    if (keyboard.x) {
      this.scale.x = keyboard.x;
      this.anchor.x = keyboard.x < 0 ? -keyboard.x * 32 : 0;
    }
    if (keyboard.x || keyboard.y) {
      this.velocity.x = keyboard.x * 200;
      this.velocity.y = keyboard.y * 200;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }
}
