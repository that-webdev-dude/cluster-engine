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
  constructor(texture, display, speed) {
    super();
    this.display = display;
    // for (let i = 0; i < Math.ceil(display.width / texture.width) + 1; i++) {
    //   const scrollingSprite = this.add(new ScrollingSprite(texture, speed));
    //   scrollingSprite.position.x = i * texture.width;
    // }
  }

  update(dt, t) {
    // super.update(dt, t);
    // for (let child of this.children) {
    //   if (child.position.x + child.width <= 0) {
    //     child.position.x += this.display.width + child.width;
    //   }
    // }
  }
}
export default Background;
