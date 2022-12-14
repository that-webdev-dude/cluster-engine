import GamePlay from "./screens/GamePlay";
import GameOver from "./screens/GameOver";
import GameTitle from "./screens/GameTitle";
import cluster from "./cluster";

import Assets from "./cluster/core/Assets";

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
  const gameTitle = () => {
    return new GameTitle(game, input, {
      onExit: () => {
        game.scene = gamePLay();
      },
    });
  };

  const gamePLay = () => {
    return new GamePlay(game, input, {
      onExit: () => {
        game.scene = gameOver();
      },
    });
  };

  const gameOver = () => {
    return new GameOver(game, input, {
      onExit: () => {
        game.scene = gameTitle();
      },
    });
  };

  Assets.onProgress((done, total) => {
    console.log(`completed ${(done / total) * 100}%`);
  });

  Assets.onReady(() => {
    console.log(`ready ok!`);
  });

  // start
  game.scene = gameTitle();
  game.run((dt, t) => {});
};
