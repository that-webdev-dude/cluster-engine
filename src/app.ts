import { Game, Container, Vector, Entity, System, Scene } from "./cluster";
import { Rect } from "./entities/Rect";
import { Circle } from "./entities/Circle";
import { RenderSystem } from "./systems/RenderSystem";

const game = new Game();

const rect = new Rect({
  position: new Vector(100, 100),
  width: 100,
  height: 100,
});
const circle = new Circle({
  position: new Vector(200, 200),
  radius: 50,
  style: {
    fill: "transparent",
    stroke: "black",
  },
});

const gameplay = new Scene("gameplay");
gameplay.addEntity(rect);
gameplay.addEntity(circle);
gameplay.addSystem(new RenderSystem());

game.addScene(gameplay);

export default () => {
  game.start();
};
