import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite.js";
import Texture from "../cluster/core/Texture.js";
import wallslide from "../cluster/movement/wallslide";

const states = {
  SLEEPING: 0,
  WALKING: 0,
  JUMPING: 0,
};

class Player extends TileSprite {
  constructor(controller, level) {
    super(new Texture(tilesImageURL), 48, 48);
    this.level = level;
    this.controller = controller;
    // this.position = { x: 48 * 2, y: level.height - 48 * 4 };
    this.hitbox = {
      x: 10,
      y: 0,
      width: 30,
      height: 48,
    };

    this.speed = 250;
    this.vel = -10;
    this.jumping = false;
    this.falling = false;

    // player animation setup - prettier-ignore
    this.animation.add("jump", [{ x: 0, y: 0 }], 0.1);
    this.animation.add(
      "sleep",
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
    const { position, controller, level, speed, gameOver } = this;

    const { x } = controller;
    const xo = x * dt * speed;
    let yo = 0;

    if (!this.jumping && controller.action) {
      this.vel = -10;
      this.jumping = true;
    }

    if (this.jumping) {
      yo += this.vel;
      this.vel += 32 * dt;
    }

    const r = wallslide(this, level, xo, yo);

    if (r.hits.down) {
      this.jumping = false;
      this.vel = 0;
    }
    if (r.hits.up) {
      this.vel = 0;
    }

    // Check if falling
    if (!this.jumping && !r.hits.down) {
      this.jumping = true;
      this.vel = 3;
    }

    position.x += r.x;
    position.y += r.y;

    // Animations
    if (x && !this.jumping) {
      this.animation.play("walk");
      if (x > 0) {
        this.lookRight();
      } else if (x < 0) {
        this.lookLeft();
      }
    } else if (!x) {
      this.animation.play("sleep");
    }
  }
}

export default Player;
