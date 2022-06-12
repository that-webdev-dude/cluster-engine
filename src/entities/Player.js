import playerImageUrl from "../images/player.png";
import cluster from "../cluster";
const { Texture, TileSprite } = cluster;

const texture = new Texture(playerImageUrl);

class Player extends TileSprite {
  constructor() {
    super(texture, 32, 32);
    this.animationRate = 0.1;
    this.currentFrame = 0;
    this.currentTime = 0;
    this.frames = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];

    this.frame = this.frames[this.currentFrame];
  }

  update(dt, t) {
    this.currentTime += dt;
    if (this.currentTime > this.animationRate) {
      this.frame = this.frames[this.currentFrame++ % this.frames.length];
      this.currentTime -= this.animationRate;
    }
  }
}

export default Player;
