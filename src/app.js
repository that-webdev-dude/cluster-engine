import cluster from "./cluster";
import GamePlay from "./screens/GamePlay";
import GameTitle from "./screens/GameTitle";
import GameOver from "./screens/GameOver";

// cluster instances
const { KeyControls, Game } = cluster;

const game = new Game({
  width: 832,
  height: 640,
});

const input = {
  key: new KeyControls(),
};

// game globals is here!
const defaults = () => ({
  newGame: true,
  data: {},
  level: 1,
  score: 0,
  lives: 3,
  spawn: null,
});
let globals = defaults();

// game screens!
/**
 * onCreate
 * onNext
 * onExit
 */
function startGameTitle() {
  globals = defaults();
  game.setScene(
    new GameTitle(game, input, globals, {
      onCreate: () => {},
      onExit: () => {
        startGamePlay(1, globals.spawn);
      },
    })
  );
}

function startGamePlay(toLevel, spawn) {
  globals.level = toLevel;
  globals.spawn = spawn;
  game.setScene(
    new GamePlay(game, input, globals, {
      onWin: startGamePlay,
      onLoose: startGameOver,
    })
  );
}

function startGameOver() {
  game.setScene(
    new GameOver(game, input, globals, {
      onExit: startGameTitle,
    })
  );
}

export default () => {
  startGameTitle();
  game.run();
};

// import GamePlay from "./screens/GamePlay";
// import GameTitle from "./screens/GameTitle";
// import cluster from "./cluster";

// // cluster library
// // prettier-ignore
// const {
//   MouseControls,
//   KeyControls,
//   Assets,
//   Game,
// } = cluster;

// // game configuration
// const config = {
//   GAME_WIDTH: 832,
//   GAME_HEIGHT: 640,
// };

// // game instance
// const game = new Game({
//   width: config.GAME_WIDTH,
//   height: config.GAME_HEIGHT,
// });

// // input instance
// const input = {
//   key: new KeyControls(),
//   mouse: new MouseControls(game.view),
// };

// // game screens
// const gameTitle = new GameTitle(game, input, {
//   onEnter: () => {},
//   onExit: () => {
//     game.setScene(gamePlay, 1);
//   },
// });

// const gamePlay = new GamePlay(game, input, {
//   onEnter: () => {},
//   onExit: () => {},
// });

// // run
// export default () => {
//   game.scene = gameTitle;
//   game.run((dt, t) => {
//     /** running... */
//   });
// };
