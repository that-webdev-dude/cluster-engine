import tilesImageURL from "../images/tiles_pixel.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
// import deadInTracks from "../cluster/movement/deadInTracks";
import wallslide from "../cluster/movement/wallslide";

class Player extends TileSprite {
  constructor(controller, level) {
    super(new Texture(tilesImageURL), 48, 48);
    this.controller = controller;
    this.level = level;

    // this.anchor = { x: 48, y: 0 };
    // this.scale = { x: -1, y: 1 };

    this.position = { x: 48, y: 48 };
    this.hitbox = {
      x: 8,
      y: 24,
      width: 30,
      height: 20,
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

    // this.animation.play("idle");
    this.animation.play("walk");
  }

  lookLeft() {
    this.anchor = { x: 48, y: 0 };
    this.scale = { x: -1, y: 1 };
  }

  lookRight() {
    this.anchor = { x: 0, y: 0 };
    this.scale = { x: 1, y: 1 };
  }

  update(dt, t) {
    super.update(dt, t);
    const dx = this.controller.x * dt * 150;
    const dy = this.controller.y * dt * 150;

    if (dx < 0) {
      this.lookLeft();
    } else if (dx > 0) {
      this.lookRight();
    }

    // can I move to this position?
    const r = wallslide(this, this.level, dx, dy);

    this.position.x += r.x;
    this.position.y += r.y;
  }
}

export default Player;
