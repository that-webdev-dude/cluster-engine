import ares from "./ares/index";
import Vector from "./ares/tools/Vector";
import Container from "./ares/core/Container";
import { Rect, Circle } from "./ares/core/Shape";
import playerImageURL from "./images/player.png";
import Sprite from "./ares/core/Sprite";
import Text from "./ares/core/Text";

const { Game } = ares;

const game = new Game({
  title: "Game",
  height: 640,
  width: 832,
});
const scene = new Container();

const rect = scene.add(
  new Rect({
    width: 100,
    height: 100,
    style: { fill: "red", stroke: "black", lineWidth: 5 },
  })
);

const circle = scene.add(
  new Circle({
    position: new Vector(200, 200),
    radius: 50,
  })
);

const ship = scene.add(
  new Sprite({
    textureURL: playerImageURL,
  })
);

const text = scene.add(
  new Text({
    text: "Hello World",
    style: { fill: "black" },
  })
);

export default () => {
  game.setScene(scene);
  game.start((dt, t) => {});
};
