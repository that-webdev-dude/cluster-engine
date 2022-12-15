// import GamePlay from "./screens/GamePlay";
// import GameOver from "./screens/GameOver";
// import GameTitle from "./screens/GameTitle";
// import Assets from "./cluster/core/Assets";
import cluster from "./cluster";
import Assets from "./cluster/core/Assets";
import plopSoundURL from "./sounds/plop.mp3";

export default () => {
  const { Game, KeyControls, MouseControls, Audio, Sound } = cluster;
  const w = 832;
  const h = 640;
  const game = new Game({ width: w, height: h });
  const input = {
    key: new KeyControls(),
    mouse: new MouseControls(game.view),
  };

  const plopSound = new Sound(plopSoundURL);

  // let actxActive = false;
  // let oscillatorNode1 = null;
  // let oscillatorNode2 = null;
  // window.addEventListener(
  //   "click",
  //   () => {
  //     if (!actxActive) {
  //       const actx = new AudioContext();

  //       // gain node
  //       const master = actx.createGain();
  //       master.gain.value = 0.1;
  //       master.connect(actx.destination);

  //       // oscillator1 node
  //       const oscillator1 = actx.createOscillator();
  //       oscillator1.type = "sine";
  //       oscillator1.frequency.value = 440;
  //       oscillator1.start();
  //       oscillator1.connect(master);

  //       // oscillator2 node
  //       const oscillator2 = actx.createOscillator();
  //       oscillator2.type = "square";
  //       oscillator2.frequency.value = 440 * 1.25;
  //       oscillator2.start();
  //       oscillator2.connect(master);

  //       actxActive = true;
  //       oscillatorNode1 = oscillator1;
  //       oscillatorNode2 = oscillator2;
  //     }
  //   },
  //   false
  // );

  // screens
  // const gameTitle = () => {
  //   return new GameTitle(game, input, {
  //     onExit: () => {
  //       game.scene = gamePLay();
  //     },
  //   });
  // };

  // const gamePLay = () => {
  //   return new GamePlay(game, input, {
  //     onExit: () => {
  //       game.scene = gameOver();
  //     },
  //   });
  // };

  // const gameOver = () => {
  //   return new GameOver(game, input, {
  //     onExit: () => {
  //       game.scene = gameTitle();
  //     },
  //   });
  // };

  // Assets.onProgress((done, total) => {
  //   console.log(`completed ${(done / total) * 100}%`);
  // });

  // Assets.onReady(() => {
  //   console.log(`ready ok!`);
  // });

  // // start
  // game.scene = gameTitle();
  Assets.onReady(() => {
    const { context, master } = Audio;
    const plopNode = context.createMediaElementSource(plopSound.audio);

    game.run((dt, t) => {
      // if (input.key.action) {
      //   oscillatorNode1.stop();
      //   oscillatorNode2.stop();
      // }
    });
  });
};
