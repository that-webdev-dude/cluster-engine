import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Bullet extends TileSprite {
  constructor(direction = { x: 0, y: 0 }) {
    super(new Texture(tilesImageURL), 48, 48);
    this.frame = { x: 4, y: 2 };
    this.speed = 200;
    this.lifespan = 5;
    this.direction = direction;
    this.hitbox = {
      x: 0,
      y: 0,
      width: 48,
      height: 48,
    };
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

    let dx = this.direction.x * this.speed * dt;
    let dy = this.direction.y * this.speed * dt;

    if (dx < 0) {
      this.lookLeft();
    } else if (dx > 0) {
      this.lookRight();
    }

    this.position.x += dx;
    this.position.y += dy;
    this.lifespan -= dt;
    if (this.lifespan < 0) {
      this.dead = true;
    }
  }
}

export default Bullet;
