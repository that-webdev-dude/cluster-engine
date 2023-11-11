import spritesheetImageURL from "../images/spritesheet.png";
import cluster from "../cluster";

const { TileSprite, Texture, math } = cluster;

class Explosion extends TileSprite {
  constructor() {
    super(new Texture(spritesheetImageURL), 32, 32);
    this.scale = { x: 2, y: 2 };
    this.dead = false;
    this.animation.add(
      "explode",
      [
        {
          x: 0,
          y: 0,
        },
        {
          x: 1,
          y: 0,
        },
        {
          x: 2,
          y: 0,
        },
        {
          x: 0,
          y: 1,
        },
        {
          x: 1,
          y: 1,
        },
        {
          x: 2,
          y: 1,
        },
        {
          x: 0,
          y: 2,
        },
        {
          x: 1,
          y: 2,
        },
      ],
      0.075,
      () => {
        this.dead = true;
      }
    );

    this.animation.play("explode");
  }
}

export default Explosion;
