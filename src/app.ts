import { Game, Vector } from "./ares";
import GamePlay from "./screens/GamePlay";

// GAME
const game = new Game({
  version: "0.0.1",
  title: "Ares",
  width: 600,
  height: 400,
});

const startGamePlay = () => {
  game.setScene(new GamePlay(game));
  game.start((dt) => {});
};

export default () => {
  startGamePlay();
};
