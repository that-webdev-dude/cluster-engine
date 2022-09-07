import cluster from "./cluster/index.js";
import GameScreen from "./screens/GameScreen.js";
import Vector from "./cluster/utils/Vector.js";

const { Game, KeyControls } = cluster;

const v1 = new Vector(100, 0);
const v2 = new Vector(-100, 0);
const dot = v1.dot(v2);
console.log("file: app.js ~ line 10 ~ dot", dot);

export default () => {
  const controller = new KeyControls();
  const game = new Game({
    height: 48 * 10,
    width: 48 * 20,
  });

  game.scene = new GameScreen(game, controller);
  // game.run(() => {});
};
