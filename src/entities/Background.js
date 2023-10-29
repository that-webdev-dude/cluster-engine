import cluster from "../cluster";
const { Sprite, Container } = cluster;

class ScrollingSprite extends Sprite {
  constructor(texture, speed) {
    super(texture);
    this.speed = speed;
  }
  update(dt, t) {
    this.position.x -= this.speed * dt;
  }
}

class Background extends Container {
  constructor(texture, game, speed) {
    super();
    this.gameH = game.height;
    this.gameW = game.width;
    for (let i = 0; i < 2; i++) {
      const scrollingSprite = this.add(new ScrollingSprite(texture, speed));
      scrollingSprite.position.x = i * game.width;
      console.log("i", i, game.width);
    }
  }
  reposition() {
    const { children } = this;
    children.forEach((child, i) => {
      if (child.position.x + child.width <= 0) {
        child.position.x += this.gameW + child.width;
      }
    });
  }
  update(dt) {
    super.update(dt);
    this.reposition();
  }
}

export default Background;
