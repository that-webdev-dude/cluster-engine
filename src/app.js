import cluster from "./cluster";
import Assets from "./cluster/core/Assets";
import GamePlay from "./screens/GamePlay";

export default () => {
  const { Game, KeyControls, MouseControls } = cluster;
  const height = 640;
  const width = 832;
  const game = new Game({ width: width, height: height });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  const gamePlay = new GamePlay(game, input);

  game.scene = gamePlay;
  Assets.onReady(() => {
    console.log("ready!");
    game.run((dt, t) => {
      // ...
    });
  });
};
