import ares from "./ares/index";
import Container from "./ares/core/Container";

const { Game } = ares;

const game = new Game({
  title: "Game",
  height: 640,
  width: 832,
});
const scene = new Container();

export default () => {
  game.setScene(scene);
  game.start((dt, t) => {});
};
