import squizzballImageUrl from "../images/squizzball.png";
import cluster from "../cluster";
const { Texture, TileSprite, math } = cluster;

const texture = new Texture(squizzballImageUrl);

class Squizzball extends TileSprite {
  constructor() {
    super(texture, 32, 32);
    this.anchor = { x: -16, y: -16 };
    this.speed = math.rand(20, 100);

    this.animation.add(
      "roll",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      0.1
    );

    this.animation.play("roll");
  }

  update(dt, t) {
    super.update(dt);
    const { position, speed } = this;
    position.x += speed * dt;
  }
}

export default Squizzball;
