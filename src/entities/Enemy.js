import spritesheetImageURL from "../images/spritesheet.png";
import cluster from "../cluster";
import Vector from "../cluster/utils/Vector";

const { TileSprite, Texture, entity, math } = cluster;

class Enemy extends TileSprite {
  constructor() {
    super(new Texture(spritesheetImageURL), 32, 32);
    this.frame = { x: 2, y: 2 };
    this.angle = math.deg2rad(270);
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.speed = null;
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };

    this.reset();
  }

  reset() {
    this.speed = math.rand(50, 200);
  }

  update(dt, t) {
    this.position.x -= this.speed * dt;
  }
}

export default Enemy;
