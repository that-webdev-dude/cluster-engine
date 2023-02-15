import charactersImageURL from "../images/characters.png";
import cluster from "../cluster/index";
// prettier-ignore
const { 
  TileSprite,
  Texture,
  Vector
} = cluster;

class Zombie extends TileSprite {
  constructor(player, level) {
    const width = 32;
    const height = 32;
    super(new Texture(charactersImageURL), width, height);
    this.level = level;
    this.player = player;
    this.animation.add(
      "idle",
      [
        { x: 1, y: 3 },
        { x: 2, y: 3 },
      ],
      0.25
    );
    this.animation.add(
      "walk",
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 3 },
      ],
      0.25
    );

    this.animation.play("walk");

    this.scale = new Vector(1, 1);
    this.anchor = new Vector(0, 0);
    this.direction = 1;
    this.position = new Vector(32 * 16, 32 * 7);
    this.velocity = new Vector();
    this.acceleration = new Vector();
    this.hitbox = {
      x: 0,
      y: 0,
      width,
      height,
    };

    // ...
  }

  get bounds() {
    const { position, width, height } = this;
    return {
      x: position.x,
      y: position.y,
      width,
      height,
    };
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
    // ...
  }
}

export default Zombie;
