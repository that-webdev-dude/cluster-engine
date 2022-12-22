import cluster from "./cluster";
import Assets from "./cluster/core/Assets";
import themeSoundURL from "./sounds/theme.mp3";

export default () => {
  const { Game, KeyControls, MouseControls, SoundBuffer } = cluster;
  const height = 640;
  const width = 832;
  const game = new Game({ width: width, height: height });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  const themeSoundBuffer = new SoundBuffer(themeSoundURL);

  Assets.onReady(() => {
    game.run((dt, t) => {
      if (input.key.action) {
        themeSoundBuffer.play();
      }
    });
  });
};
