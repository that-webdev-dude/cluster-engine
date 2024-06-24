import { Game } from "./cluster";

export default () => {
  const game = new Game({
    width: 800,
    height: 600,
  });
  game.start();
};
