import enemyImageURL from "../images/enemy.png";
import cluster from "../cluster";

const { Sprite, Texture, math } = cluster;

class Enemy extends Sprite {
  constructor(game, input) {
    super(new Texture(enemyImageURL));
    this.gameHeight = game.height;
    this.gameWidth = game.width;
    this.input = input;
    this.speed = null;
  }

  reset() {
    this.speed = math.rand(50, 200);
    this.position.set(
      this.gameWidth - this.width,
      math.rand(0, this.gameHeight - this.height)
    );

    const scale = math.rand(1, 3);
    this.scale.x = scale;
    this.scale.y = scale;
  }

  update(dt, t) {
    this.position.x -= this.speed * dt;
    if (this.position.x + this.width < 0) {
      this.dead = true;
    }
  }
}

export default Enemy;
