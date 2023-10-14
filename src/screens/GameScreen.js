import Screen from "./Screen";
import cluster from "../cluster";

// background
import Sprite from "../cluster/core/Sprite";
import Texture from "../cluster/core/Texture";
import Container from "../cluster/core/Container";
import backgroundImageURL from "../images/background.png";

class ScrollingSprite extends Sprite {
  constructor(texture, speed) {
    super(texture);
    this.speed = speed;
  }

  update(dt, t) {
    this.position.x -= this.speed * dt;
  }
}

class ScrollingBackground extends Container {
  constructor(displayWidth, texture, speed) {
    super();
    this.displayWidth = displayWidth;
    this.textureImage = texture;
    this.noSprites = null;
    this.speed = speed;
    this.initialize();
  }

  initialize() {
    const { displayWidth, textureImage, speed } = this;
    this.noSprites = Math.ceil(displayWidth / textureImage.width) + 1;
    for (let i = 0; i < this.noSprites; i++) {
      const sprite = new ScrollingSprite(textureImage, speed);
      sprite.position.x = i * sprite.width;
      this.add(sprite);
    }
  }

  reposition() {
    this.children.forEach((child, index) => {
      if (child.position.x + child.width < 0) {
        child.position.x += child.width * this.noSprites;
      }
    });
  }

  // update(dt, t) {
  //   super.update(dt, t);
  //   // this.reposition();
  // }
}

class GameScreen extends Screen {
  constructor(game, input) {
    super(game, input);
    this.add(
      new ScrollingBackground(game.width, new Texture(backgroundImageURL), 50)
    );
    // game state here ...

    this.firstUpdate = true;
    // game.speed = 0;
  }

  update(dt, t) {
    super.update(dt, t);
    // game logic here ...

    if (this.firstUpdate) {
      // ...
      this.firstUpdate = false;
    }
  }
}

export default GameScreen;
