import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite.js";
import Texture from "../cluster/core/Texture.js";
import wallslide from "../cluster/movement/wallslide";

class Player extends TileSprite {
  constructor(controller, game, level) {
    super(new Texture(tilesImageURL), 48, 48);
    this.game = game;
    this.map = level;
    this.controls = controller;
    this.position = { x: 48 * 2, y: game.height - 48 * 4 };
    this.hitbox = {
      x: 10,
      y: 0,
      width: 30,
      height: 46,
    };

    this.speed = 250;
    this.vel = -10;
    this.jumping = false;

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
    const { position, controls, map, speed, gameOver } = this;

    // if (gameOver) {
    //   this.rotation += dt * 5;
    //   this.pivot.y = 24;
    //   this.pivot.x = 24;
    //   return;
    // }

    const { x } = controls;
    const xo = x * dt * speed;
    let yo = 0;

    if (!this.jumping && controls.action) {
      this.vel = -10;
      this.jumping = true;
    }

    if (this.jumping) {
      yo += this.vel;
      this.vel += 32 * dt; // need a consistent delta time
    }

    const r = wallslide(this, map, xo, yo);

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
    // if ((this.invincible -= dt) > 0) {
    //   this.alpha = (t * 10 % 2) | 0 ? 0 : 1;
    // } else {
    //   this.alpha = 1;
    // }

    // if (x && !this.jumping) {
    //   this.frame.x = ((t / 0.1) | 0) % 4;
    //   if (x > 0) {
    //     this.anchor.x = 0;
    //     this.scale.x = 1;
    //   } else if (x < 0){
    //     this.anchor.x = this.w;
    //     this.scale.x = -1;
    //   }
    // }
  }
}

export default Player;
