import ares from "../ares";
import Vector from "../ares/tools/Vector";
const { Rect } = ares;

class Bullet extends Rect {
  private _speed: number;

  constructor(position: Vector = new Vector()) {
    super({ width: 4, height: 4, fill: "red", position });
    this._speed = 400;
  }

  set color(color: string) {
    this.fill = color;
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    this.position.x += this._speed * dt;
  }
}

export default Bullet;
