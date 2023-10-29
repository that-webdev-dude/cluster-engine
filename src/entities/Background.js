import cluster from "../cluster";
const { Sprite, Container, Vector, Texture, Assets } = cluster;

/**
 * A sprite that scrolls across the screen.
 * @class
 * @extends Sprite
 */
class ScrollingSprite extends Sprite {
  /**
   * Creates a new ScrollingSprite.
   * @param {Texture} texture - The texture to use for the sprite.
   * @param {Velocity} velocity - The velocity at which the sprite should scroll.
   */
  constructor(texture, velocity) {
    super(texture);
    this.velocity = velocity;
  }

  /**
   * Updates the position of the sprite based on the elapsed time and current time.
   * @param {number} dt - The elapsed time since the last update, in seconds.
   */
  update(dt) {
    this.position.add(this.velocity.clone().scale(dt));
  }
}

/**
 * A scrolling background in the game.
 * @class
 * @extends Container
 */
class Background extends Container {
  /**
   * Represents a background entity that can be added to a game scene.
   * @class
   * @extends Container
   * @param {Object} [options] - The options for the background entity.
   * @param {Texture} [options.texture=new Texture()] - The texture to use for the background.
   * @param {number} [options.displayW=0] - The width of the display.
   * @param {number} [options.displayH=0] - The height of the display.
   * @param {Vector} [options.velocity=new Vector()] - The velocity of the background.
   */
  constructor(
    {
      texture = new Texture(),
      displayW = 0,
      displayH = 0,
      velocity = new Vector(),
    } = {
      texture: new Texture(),
      displayW: 0,
      displayH: 0,
      velocity: new Vector(),
    }
  ) {
    if (velocity.x && velocity.y)
      console.warn("Background: diagonal scrolling not supported yet!");

    super();
    this.displayW = displayW;
    this.displayH = displayH;
    this.scrolling = velocity.magnitude > 0 ? true : false;
    this.direction = new Vector(
      velocity.x != 0 ? velocity.x / Math.abs(velocity.x) : 0,
      velocity.y != 0 ? velocity.y / Math.abs(velocity.y) : 0
    );

    for (let i = 0; i < 2; i++) {
      const scrollingSprite = this.add(new ScrollingSprite(texture, velocity));
      scrollingSprite.position.x = -this.direction.x * i * displayW;
      scrollingSprite.position.y = this.direction.y * i * displayH;
    }
  }

  /**
   * Repositions the background sprites when they go off-screen.
   */
  reposition() {
    const { children, direction } = this;
    children.forEach((child, i) => {
      switch (direction.x) {
        case -1:
          if (child.position.x + child.width <= 0) {
            child.position.x += this.displayW + child.width;
          }
          break;
        case 1:
          if (child.position.x >= this.displayW) {
            child.position.x -= this.displayW + child.width;
          }
          break;
      }

      switch (direction.y) {
        case -1:
          if (child.position.y + child.height <= 0) {
            child.position.y += this.displayH + child.height;
          }
          break;
        case 1:
          if (child.position.y >= this.displayH) {
            child.position.y -= this.displayH + child.height;
          }
          break;
      }
    });
  }

  /**
   * Updates the background.
   * @param {number} dt - The time elapsed since the last update.
   */
  update(dt) {
    if (this.scrolling) {
      super.update(dt);
      this.reposition();
    }
  }
}

export default Background;
