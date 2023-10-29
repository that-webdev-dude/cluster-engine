import Screen from "./Screen";
import cluster from "../cluster";

// background
import backgroundImageURL from "../images/background.png";

const { Texture, Sprite, Container } = cluster;

// =============================================================================
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
      // const scrollingSprite = this.add(new ScrollingSprite(texture, speed));
      // scrollingSprite.position.x = i * texture.width;
      console.log("i", i, texture.width);
    }
  }
  reposition() {
    // const { children } = this;
    // children.forEach((child, i) => {
    //   if (child.position.x + child.width <= 0) {
    //     child.position.x += this.gameW + child.width;
    //   }
    // });
  }
  update(dt) {
    super.update(dt);
    // this.reposition();
  }
}
// =============================================================================

class TestScreen extends Screen {
  constructor(game, input) {
    super(game, input);

    const backgroundTexture = new Texture(backgroundImageURL);
    const background = new Background(backgroundTexture, game, 50);

    this.background = this.add(background);
  }

  update(dt, t) {
    super.update(dt, t);
    // ...
  }
}

export default TestScreen;
