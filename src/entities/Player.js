import cluster from "../cluster";
import spritesheetImageURL from "../images/spritesheet.png";
// prettier-ignore
const { 
    TileSprite, 
    Texture, 
    Vector 
} = cluster;

const texture = new Texture(spritesheetImageURL);

class Player extends TileSprite {
  constructor(input, position = new Vector()) {
    const height = 32;
    const width = 32;
    super(texture, width, height);

    this.input = input;
    this.animation.add(
      "idle",
      [
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      0.25
    );
    this.animation.add(
      "walk",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ],
      0.05
    );

    this.speed = 250;
    this.position = position;
    this.anchor = new Vector(0, 0);
    this.scale = new Vector(1, 1);
    // this.dead = true;
  }

  lookRight() {
    const { scale, anchor } = this;
    scale.set(1, 1);
    anchor.set(0, 0);
    this.direction = 1;
  }

  lookLeft() {
    const { scale, anchor, width } = this;
    scale.set(-1, 1);
    anchor.set(width, 0);
    this.direction = -1;
  }

  update(dt, t) {
    super.update(dt, t);
    const { animation, input, position, speed } = this;
    const { key } = input;
    if (key.x > 0) this.lookRight();
    if (key.x < 0) this.lookLeft();
    if (key.x || key.y) {
      const dx = dt * key.x * speed;
      const dy = dt * key.y * speed;
      position.add(new Vector(dx, dy));
      animation.play("walk");
    } else {
      animation.play("idle");
    }
  }
}

export default Player;
