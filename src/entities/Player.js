import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite.js";
import Texture from "../cluster/core/Texture.js";

class Player extends TileSprite {
  constructor(controller, game) {
    super(new Texture(tilesImageURL), 48, 48);
    this.game = game;
    this.controller = controller;
    this.position = { x: 48, y: game.height - 48 };
    this.speed = { x: 200, y: -10 };
    this.jumping = false;
    this.hitbox = {
      x: 0,
      y: 0,
      width: 48,
      height: 48,
    };

    // player animation setup - prettier-ignore
    this.animation.add("jump", [{ x: 0, y: 0 }], 0.1);
    this.animation.add(
      "rest",
      [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      0.25
    );
    this.animation.add(
      "walk",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ],
      0.1
    );
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

    if (!this.jumping && this.controller.action) {
      this.jumping = true;
    }

    if (this.jumping) {
      this.speed.y += 32 * dt;
      this.position.y += this.speed.y;
    }

    if (this.jumping && this.position.y > this.game.height - 48) {
      this.position.y = this.game.height - 48;
      this.jumping = false;
      this.speed.y = -10;
    }

    if (this.controller.x) {
      let dx = this.speed.x * dt * this.controller.x;
      this.position.x += dx;
      this.animation.play("walk");
      dx > 0 ? this.lookRight() : this.lookLeft();
    } else {
      this.animation.play("rest");
    }
  }
}

export default Player;
