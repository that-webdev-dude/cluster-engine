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

class ScrollingBackground extends Container {
  constructor(textureImage, displayWidth, speed) {
    super();
    this.textureImage = textureImage;
    this.displayWidth = displayWidth;
    this.speed = speed;
    this.noSprites = null;
    this.initialize();
  }

  initialize() {
    const { textureImage, displayWidth, speed } = this;
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

  update(dt, t) {
    super.update(dt, t);
    this.reposition();
  }
}

export default ScrollingBackground;
