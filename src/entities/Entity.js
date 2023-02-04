import cluster from "../cluster";

const { Texture, TileSprite, Vector } = cluster;
class Entity extends TileSprite {
  constructor({
    textureURL,
    spriteW,
    spriteH,
    hitbox,
    animations,
    acceleration,
    velocity,
    position,
  } = config) {
    // tilesprite setup
    super(new Texture(textureURL), spriteW, spriteH);

    // animation setup
    animations.forEach((animation) => {
      const { name, rate, frames } = animation;
      this.animation.add(name, frames, rate);
    });

    // physics setup
    this.acceleration = acceleration;
    this.velocity = velocity;
    this.position = position;
    this.direction = 1;

    // default setup
    this.anchor = new Vector(-16, 0);
    this.scale = new Vector(1, 1);
    this.hitbox = hitbox;
  }

  lookRight() {
    const { scale, anchor } = this;
    scale.set(1, 1);
    anchor.set(-16, 0);
    this.direction = 1;
  }

  lookLeft() {
    const { scale, anchor } = this;
    scale.set(-1, 1);
    anchor.set(16, 0);
    this.direction = -1;
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default Entity;
