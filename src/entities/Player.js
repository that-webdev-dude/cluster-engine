import charactersImageURL from "../images/zomb0.png";
import cluster from "../cluster";
const { Texture, TileSprite, Vector } = cluster;

class Player extends TileSprite {
  constructor(input) {
    super(new Texture(charactersImageURL), 32, 32);
    this.input = input;
    this.speed = 175;
    this.scale = new Vector(1, 1);
    this.anchor = new Vector(-16, -16);
    this.position = new Vector(100, 100);
    this.animation.add(
      "idle",
      [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      0.25
    );
    this.animation.add(
      "walk",
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      0.075
    );
  }

  update(dt, t) {
    super.update(dt, t);
    const { input, animation, position, scale, anchor, speed } = this;
    if (input.key.x === 1) {
      scale.set(1, 1);
      anchor.set(-16, -16);
      position.x += speed * dt;
      animation.play("walk");
    } else if (input.key.x === -1) {
      scale.set(-1, 1);
      anchor.set(16, -16);
      position.x -= speed * dt;
      animation.play("walk");
    } else {
      animation.play("idle");
    }

    if (input.key.y === 1) {
      position.y += speed * dt;
    } else if (input.key.y === -1) {
      position.y -= speed * dt;
    }
  }
}

export default Player;
