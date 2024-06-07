import { Game } from "./cluster";
import { gameplay } from "./scenes/gamePlay";

export default () => {
  const game = new Game({
    width: 800,
    height: 600,
    title: "Game",
    version: "1.0.0",
  });

  game.addScene(gameplay);
  game.start();
};
