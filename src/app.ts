import { Game, Vector, Scene } from "./cluster";
import { Rect } from "./entities/Rect";
import { Circle } from "./entities/Circle";
import { Text } from "./entities/Text";
import { RenderSystem } from "./systems/RenderSystem";

const game = new Game();

const rect = new Rect({
  position: new Vector(100, 100),
  width: 100,
  height: 100,
  angle: 45,
  alpha: 0.5,
  visible: true,
  pivot: new Vector(50, 50),
});
const circle = new Circle({
  position: new Vector(200, 200),
  radius: 16,
  style: {
    fill: "lightgreen",
    stroke: "transparent",
  },
});
const text = new Text({
  position: new Vector(300, 300),
  text: "Hello, World!",
  style: {
    font: '16px "Press Start 2P"',
    fill: "lightblue",
    stroke: "transparent",
  },
});

class Player extends Rect {
  constructor() {
    super({
      position: new Vector(400, 400),
      width: 32,
      height: 32,
      style: {
        fill: "lightcoral",
        stroke: "transparent",
      },
    });
  }
}

const player = new Player();

const gameplay = new Scene("gameplay");
gameplay.addEntity(rect);
gameplay.addEntity(circle);
gameplay.addEntity(text);
gameplay.addEntity(player);
gameplay.addSystem(new RenderSystem());

game.addScene(gameplay);

export default () => {
  game.start();
};
