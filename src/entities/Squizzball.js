import squizzballImageUrl from "../images/squizzball.png";
import cluster from "../cluster";
const { Texture, TileSprite, math } = cluster;

const texture = new Texture(squizzballImageUrl);

class Squizzball extends TileSprite {
  constructor() {
    super(texture, 32, 32);
    this.speed = math.rand(20, 100);
    this.anchor = { x: -16, y: -16 };
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
    const { position, speed } = this;
    position.x += speed * dt;

    this.currentTime += dt;
    if (this.currentTime > this.animationRate) {
      this.frame = this.frames[this.currentFrame++ % this.frames.length];
      this.currentTime -= this.animationRate;
    }
  }
}

export default Squizzball;
