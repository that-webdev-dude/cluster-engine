import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Player extends TileSprite {
  constructor() {
    super(new Texture(tilesImageURL), 48, 48);
    this.animation.add(
      "walk",
      [
        // { x: 0, y: 0 },
        // { x: 0, y: 1 },
        // { x: 0, y: 2 },
        // { x: 0, y: 3 },
        // { x: 0, y: 4 },
        { x: 0, y: 5 },
      ],
      0.1
    );

    this.animation.play("walk");
  }

  update(dt, t) {}
}

export default Player;
