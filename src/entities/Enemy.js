import charactersImageURL from "../images/characters.png";
import cluster from "../cluster";

const { TileSprite, Texture, Physics, Vector } = cluster;

class Enemy extends TileSprite {
  constructor(targetEntity, position) {
    super(new Texture(charactersImageURL), 32, 32);
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
      0.05
    );

    this.animation.play("idle");

    this.position = Vector.from(position);
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default Enemy;
