import GamePlay from "./screens/GamePlay";
import GameOver from "./screens/GameOver";
import GameTitle from "./screens/GameTitle";
import cluster from "./cluster";

import Assets from "./cluster/core/Assets";
import sound1URL from "./sounds/sound1.mp3";
import sound2URL from "./sounds/sound2.mp3";
import sound3URL from "./sounds/sound3.mp3";
import sound4URL from "./sounds/sound4.mp3";
import sound5URL from "./sounds/sound5.mp3";

export default () => {
  const { Game, KeyControls, MouseControls, Sound } = cluster;
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

  const s1 = new Sound(sound1URL);
  const s2 = new Sound(sound2URL);
  const s3 = new Sound(sound3URL);
  const s4 = new Sound(sound4URL);
  const s5 = new Sound(sound5URL);

  Assets.onProgress((done, total) => {
    console.log(`completed ${(done / total) * 100}%`);
  });

  Assets.onReady(() => {
    console.log(`ready!`);
  });

  // start
  game.scene = gameTitle();
  game.run((dt, t) => {});
};
