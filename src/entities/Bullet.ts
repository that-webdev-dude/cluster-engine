import { Rect, Vector, TileSprite } from "../ares";
import bulletsImageURL from "../images/bullets.png";

class Bullet extends TileSprite {
  private _speed: number;

  constructor(position: Vector = new Vector()) {
    super({ tileH: 12, tileW: 12, textureURL: bulletsImageURL });
    this.position = position;
    this._speed = 400;
  }

  // set color(color: string) {
  //   this.fill = color;
  // }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    this.position.x += this._speed * dt;
  }
}

export default Bullet;
