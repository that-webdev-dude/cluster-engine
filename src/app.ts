import GameTitle from "./screens/GameTitle";
import ares from "./ares";

const { Game } = ares;

const defaults = () => ({
  levelID: 1,
  scores: 0,
  lives: 3,
});
let globals = defaults();

const game = new Game({
  version: "0.0.1",
  title: "Ares",
  width: 832,
  height: 640,
});

const startGameTitle = () => {
  globals = defaults();
  game.setScene(
    new GameTitle(game, globals, {
      onEnter: () => {
        console.log("entering GameTitle");
      },
      onExit: () => {
        console.log("exiting GameTitle");
      },
    }),
    0.75
  );
};

export default () => {
  startGameTitle();
  game.start();
};
