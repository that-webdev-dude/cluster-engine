import { TileSprite, Vector, Keyboard } from "../cluster";
import { Cluster } from "../cluster/types/cluster.types";
import spritesheetImageURL from "../images/spritesheet.png";

export class Player extends TileSprite {
  keyboard: Keyboard;

  constructor(position: Vector, keyboard: Keyboard) {
    super({
      imageURL: spritesheetImageURL,
      position: position,
      tileWidth: 32,
      tileHeight: 32,
      mass: 1000,
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
      this.acceleration.x = keyboard.x * 1800;
      this.acceleration.y = keyboard.y * 1800;
    } else {
    }

    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;
    this.velocity.x *= 0.92;
    this.velocity.y *= 0.92;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.acceleration.set(0, 0);
  }
}
