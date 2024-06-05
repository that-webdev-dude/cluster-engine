import { Scene, Vector } from "../cluster";
import { Rect } from "../entities/Rect";
import { Text } from "../entities/Text";
import { Circle } from "../entities/Circle";
import { Player } from "../entities/Player";
import { InputSystem } from "../systems/InputSystem";
import { RenderSystem } from "../systems/RenderSystem";

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
const player = new Player();

const gameplay = new Scene("gameplay");
gameplay.entities.add(rect, circle, text, player);
gameplay.systems.add(new InputSystem(), new RenderSystem());

export { gameplay };
