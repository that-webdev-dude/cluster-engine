import cluster from "./cluster";
import Assets from "./cluster/core/Assets";
import plopSoundURL from "./sounds/plop.mp3";

export default () => {
  const { Game, KeyControls, MouseControls, Audio, SoundBuffer } = cluster;
  const height = 640;
  const width = 832;
  const game = new Game({ width: width, height: height });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  const sound = new SoundBuffer(plopSoundURL, Audio.context);

  function highpassFilter(context) {
    // https://webaudio.github.io/web-audio-api/#enumdef-biquadfiltertype
    const filter = context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 2660;
    filter.Q.value = 25;
    return filter;
  }
  const highpass = highpassFilter(Audio.context);

  Assets.onReady(() => {
    game.run((dt, t) => {
      if (input.key.action) {
        sound.play({ speed: 1, filter: highpass });
      }
    });
  });
};
