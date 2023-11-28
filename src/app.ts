import ares from "./ares";
import Player from "./entities/Player";
import LaserShootSoundURL from "./sounds/Laser.wav";
import SoundtrackSoundURL from "./sounds/soundtrack.mp3";

const game = new ares.Game({
  version: "0.0.1",
  title: "Ares",
  width: 832,
  height: 640,
});

const fireSound = new ares.Sound(LaserShootSoundURL, {
  volume: 0.25,
  speed: 1,
  // filter: {
  //   type: "lowpass",
  //   frequency: 2500,
  //   gain: 10,
  //   Q: 5,
  // },
});

const soundtrack = new ares.Sound(SoundtrackSoundURL);

const player = new Player({
  input: game.keyboard,
  onFire: () => {
    fireSound.play();
    console.log("file: app.ts:27 ~ fireSound:", fireSound);
  },
});

game.scene.add(player);

export default () => {
  game.start(() => {
    if (game.keyboard.action && !soundtrack.playing) {
      soundtrack.play({
        loop: true,
        volume: 0.25,
      });
    }
  });
};
