import ares from "./ares/index";
import { CanvasRect, CanvasCircle } from "./ares/core/Shape";
import { KeyboardInput, MouseInput } from "./ares/input";
import CanvasText from "./ares/core/Text";
import Container from "./ares/core/Container";
import Vector from "./ares/tools/Vector";

const { Game } = ares;

const game = new Game({
  title: "Game",
  height: 640,
  width: 832,
  input: {
    mouse: new MouseInput(),
    keyboard: new KeyboardInput(),
  },
});
const scene = new Container();

// prettier-ignore
const rect = scene.add(
  new CanvasRect({
    position: new Vector(100, 100),
    height: 100,
    width: 100,
    style: {
      fill: "black",
      stroke: "red",
      lineWidth: 5
    },
  })
);

const circle = scene.add(
  new CanvasCircle({
    position: new Vector(100, 100),
    radius: 100,
    alpha: 0.5,
  })
);

const text = scene.add(
  new CanvasText({
    position: new Vector(100, 100),
    text: "Hello World",
    style: { fill: "red", align: "center" },
  })
);

export default () => {
  const { input } = game;
  game.setScene(scene);
  game.start((dt, t) => {
    if (input?.keyboard && input?.keyboard.x) {
      rect.position.x += input?.keyboard.x * dt * 100;
      if (rect.position.x < 0) {
        rect.visible = false;
      } else {
        rect.visible = true;
      }
    }
    // if (mouse.isDown || mouse.isReleased) {
    //   console.log(mouse.position);
    // }
    // mouse.update();
  });
};

// Path: src/app.js
// import GameTitle from "./screens/GameTitle";
// import GamePlay from "./screens/GamePlay";
// import GameOver from "./screens/GameOver";
// import cluster from "./cluster";

// // prettier-ignore
// const {
//   MouseControls,
//   KeyControls,
//   Game,
// } = cluster;

// const game = new Game({
//   title: "Amazing Game",
//   height: 640,
//   width: 832,
// });

// const input = {
//   mouse: new MouseControls(game.view),
//   keys: new KeyControls(),
// };

// const defaults = () => ({
//   levelId: 1,
//   // ... MAIN GAME STATE HERE ...
// });
// let globals = defaults();

// // DELETE THIS TO DISABLE GAME TEST ...
// // const startGameTest = () => {
// //   game.setScene(new GameTest(game, input, globals, {}), 0);
// // };

// const startGameTitle = () => {
//   globals = defaults();
//   game.setScene(
//     new GameTitle(game, input, globals, {
//       onPlay: () => {
//         startGamePlay(globals.levelId);
//       },
//     }),
//     0.75
//   );
// };

// const startGamePlay = (toLevel = 1) => {
//   globals.levelId = toLevel;
//   game.setScene(
//     new GamePlay(game, input, globals, {
//       onLoose: () => {
//         startGameOver();
//       },
//     }),
//     0.75
//   );
// };

// const startGameOver = () => {
//   game.setScene(
//     new GameOver(game, input, globals, {
//       onPlay: () => {
//         startGameTitle();
//       },
//     }),
//     0.75
//   );
// };

// export default () => {
//   startGameTitle();
//   game.run((dt, t) => {
//     // ...
//   });
// };
