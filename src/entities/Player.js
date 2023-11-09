import spritesheetImageURL from "../images/spritesheet.png";
import cluster from "../cluster";

const { TileSprite, Texture, entity, math } = cluster;

class Player extends TileSprite {
  constructor(game, input) {
    super(new Texture(spritesheetImageURL), 32, 32);
    this.frame = { x: 1, y: 3 };
    this.angle = math.deg2rad(90);
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.gameHeight = game.height;
    this.gameWidth = game.width;
    this.input = input;
    this.speed = 200;
    this.position.set(100, this.gameHeight / 2 - this.width);
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };

    this.totalShotTime = 0;
    this.lastShotTime = 0;
    this.canFire = false;
    this.fireRate = 0.25;
  }

  update(dt, t) {
    const { input, speed, position } = this;
    if (input.keys.x) {
      position.x += input.keys.x * speed * dt;
    }
    if (input.keys.y) {
      position.y += input.keys.y * speed * dt;
    }

    position.set(
      math.clamp(position.x, 0, this.gameWidth - this.width),
      math.clamp(position.y, 0, this.gameHeight - this.height)
    );

    if (input.keys.action) {
      this.totalShotTime += dt;
      if (this.totalShotTime - this.lastShotTime > this.fireRate) {
        this.lastShotTime = this.totalShotTime;
        this.canFire = true;
      } else {
        this.canFire = false;
      }
    } else {
      this.totalShotTime = 0;
      this.lastShotTime = 0;
      this.canFire = false;
    }
  }
}

export default Player;
