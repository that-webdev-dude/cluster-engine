import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import deadInTracks from "../cluster/movement/deadInTracks";

class Player extends TileSprite {
  constructor(controller, level) {
    super(new Texture(tilesImageURL), 48, 48);
    this.controller = controller;
    this.level = level;

    this.position = { x: 48, y: 48 };
    this.hitbox = {
      x: 8,
      y: 24,
      width: 30,
      height: 24,
    };

    this.animation.add(
      "walk",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      0.1
    );
    this.animation.add(
      "idle",
      [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      0.25
    );

    this.animation.play("idle");
    // this.animation.play("walk");
  }

  update(dt, t) {
    super.update(dt, t);
    const dx = this.controller.x * dt * 100;
    const dy = this.controller.y * dt * 100;
    // // can I move to this position?
    const r = deadInTracks(this, this.level, dx, dy);
    if (r.x !== 0 && r.y !== 0) {
      r.x /= Math.sqrt(2);
      r.y /= Math.sqrt(2);
    }
    this.position.x += r.x;
    this.position.y += r.y;
  }
}

export default Player;
