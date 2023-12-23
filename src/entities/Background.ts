import { Rect, Cmath, Vector, Container } from "../ares";
import Star from "./Star";

type BackgroundConfig = {
  width: number;
  height: number;
};

class Background extends Container {
  private _stars: Container;
  private _width: number;
  private _height: number;

  constructor(config: BackgroundConfig) {
    const { width, height } = config;
    super();
    this.add(
      new Rect({
        width,
        height,
        fill: "#000",
      })
    );

    this._width = width;
    this._height = height;
    this._stars = new Container();
    for (let i = 0; i <= 100; i++) {
      const posX = Cmath.rand(0, width);
      const posY = Cmath.rand(0, height);
      const speed = Cmath.rand(-50, -10);
      this._stars.add(
        new Star({
          position: new Vector(posX, posY),
          speed: new Vector(speed, 0),
          alpha: Cmath.randf(0.1, 0.5),
          size: Cmath.rand(2, 4),
          fill: `white`,
        })
      );
    }
    this.add(this._stars);
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);
    this._stars.children.forEach((star) => {
      if (star instanceof Star) {
        if (star.position.x + star.width < 0) {
          const posX = this._width + 10;
          const posY = Cmath.rand(0, this._height);
          star.position.set(posX, posY);
        }
      }
    });
  }
}

export default Background;
