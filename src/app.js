import cluster from "./cluster";
import Assets from "./cluster/core/Assets";
import GamePlay from "./screens/GamePlay";
import GameTitle from "./screens/GameTitle";

export default () => {
  const { Game, KeyControls, MouseControls } = cluster;
  const height = 32 * 20;
  const width = 32 * 26;
  const game = new Game({ width: width, height: height });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  const gameTitle = new GameTitle(game, input, {
    onExit: () => {
      game.scene = gamePlay;
    },
  });

  const gamePlay = new GamePlay(game, input);

  // game.scene = gameTitle;
  game.scene = gamePlay;

  Assets.onReady(() => {
    game.run((dt, t) => {
      // ...
    });
  });
};
