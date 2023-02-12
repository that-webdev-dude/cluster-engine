import cluster from "./cluster";
import Assets from "./cluster/core/Assets";
import GamePlay from "./screens/GamePlay";
import GameTest from "./screens/GameTest";

export default () => {
  const { Game, KeyControls, MouseControls } = cluster;
  const height = 32 * 20;
  const width = 32 * 26;
  const game = new Game({ width: width, height: height });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  const gamePlay = new GamePlay(game, input);

  game.scene = gamePlay;
  Assets.onReady(() => {
    game.run((dt, t) => {
      // ...
    });
  });
};
