import ares from "./ares";
import { Rect } from "./ares/core/Shape";

const { Game, Container, Circle, Vector, Cmath } = ares;

const game = new Game({
  version: "0.0.1",
  title: "Ares",
  width: 832,
  height: 640,
});

class MovingCircle extends Circle {
  constructor() {
    super({
      radius: 10,
      fill: "white",
      position: new Vector(
        Cmath.rand(0, game.width - 20),
        Cmath.rand(0, game.height - 20)
      ),
    });

    console.log(this.width, this.height);
  }

  public update() {
    const { position } = this;
    position.x += Cmath.rand(-2, 3);
    position.y += Cmath.rand(-2, 3);

    this.position.x = Cmath.clamp(position.x, 0, game.width - 20);
    this.position.y = Cmath.clamp(position.y, 0, game.height - 20);
  }
}

class MovingBackground extends Rect {
  constructor() {
    super({
      fill: "black",
      width: game.width,
      height: game.height,
    });
  }

  public update() {
    this.fill = `rgb(${Cmath.rand(0, 255)}, ${Cmath.rand(0, 255)}, ${Cmath.rand(
      0,
      255
    )})`;
  }
}

const circles = new Container();
for (let i = 0; i < 100; i++) {
  circles.add(new MovingCircle());
}

game.scene.add(new MovingBackground());
game.scene.add(circles);

export default () => {
  game.start(() => {
    // console.log("game started");
  });
};
