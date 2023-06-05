import cluster from "../cluster";
import spritesheetImageURL from "../images/spritesheet.png";
// prettier-ignore
const { 
    TileSprite, 
    Texture, 
    Vector 
} = cluster;

const texture = new Texture(spritesheetImageURL);

class Zombie extends TileSprite {
  constructor(type = 1, position = new Vector()) {
    const height = 32;
    const width = 32;
    super(texture, width, height);

    this.animation.add(
      "idle",
      [
        { x: 4, y: type },
        { x: 5, y: type },
      ],
      0.25
    );

    this.speed = 125;
    this.position = position;
    this.anchor = new Vector(0, 0);
    this.scale = new Vector(1, 1);

    this.animation.play(`idle`);
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default Zombie;
