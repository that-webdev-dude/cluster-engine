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
  }

  update(dt, t) {
    super.update(dt, t);
    this.position.x += this.direction.x * this.speed * dt;
    this.position.y += this.direction.y * this.speed * dt;
    this.lifespan -= dt;
    if (this.lifespan < 0) {
      this.dead = true;
    }
  }
}

export default Bullet;
