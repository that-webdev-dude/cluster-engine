import { Game } from "./cluster";
import { gameplay } from "./scenes/Gameplay";

const game = new Game();

game.addScene(gameplay);

export default () => {
  game.start();
};
