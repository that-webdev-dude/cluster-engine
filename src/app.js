// imports
import GameScreen from "./screens/GameScreen";
import cluster from "./cluster";

export default () => {
  const { Game, KeyControls, MouseControls } = cluster;
  const w = 800;
  const h = 400;
  const game = new Game({ width: w, height: h });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  const play = () => {
    game.scene = new GameScreen(game, input, play);
  };

  play();
  // game.run();
};
