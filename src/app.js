import GamePlayScreen from "./screens/GamePlayScreen";
import cluster from "./cluster";

export default () => {
  const { Game, KeyControls, MouseControls } = cluster;
  const w = 832;
  const h = 640;
  const game = new Game({ width: w, height: h });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  // screens
  const gamePLay = () => {
    game.scene = new GamePlayScreen(game, input, gamePLay);
  };

  // start
  game.scene = new GamePlayScreen(game, input, gamePLay);
  game.run();
};
