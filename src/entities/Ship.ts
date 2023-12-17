import { TileSprite, Vector, Cmath, Container } from "../ares";
import PlayerImageURL from "../images/spritesheet.png";

class Ship extends TileSprite {
  private _parent: Container;

  constructor(parent: Container) {
    super({
      textureURL: PlayerImageURL,
      tileW: 32,
      tileH: 32,
      frame: { x: 1, y: 3 },
      angle: Cmath.deg2rad(90),
      pivot: new Vector(16, 16),
    });
    this._parent = parent;
  }

  get hitBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this._parent.position.x,
      y: this._parent.position.y,
      width: this.width,
      height: this.height,
    };
  }
}

export default Ship;
