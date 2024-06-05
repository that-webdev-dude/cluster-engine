import { Game } from "./cluster";
import { gameplay } from "./scenes/gamePlay";

export default () => {
  const game = new Game();

  game.addScene(gameplay);
  game.start();
};
