import GameTitle from "./screens/GameTitle";
import GamePlay from "./screens/GamePlay";
import GameOver from "./screens/GameOver";
import cluster from "./cluster";

// prettier-ignore
const {
  MouseControls,
  KeyControls,
  Game,
} = cluster;

const game = new Game({
  title: "Physimania",
  height: 640,
  width: 832,
});

const input = {
  mouse: new MouseControls(game.view),
  keys: new KeyControls(),
};

const defaults = () => ({
  levelId: 1,
  // ... MAIN GAME STATE HERE ...
});
let globals = defaults();

// DELETE THIS TO DISABLE GAME TEST ...
// const startGameTest = () => {
//   game.setScene(new GameTest(game, input, globals, {}), 0);
// };

const startGameTitle = () => {
  globals = defaults();
  game.setScene(
    new GameTitle(game, input, globals, {
      onPlay: () => {
        startGamePlay(globals.levelId);
      },
    }),
    0.75
  );
};

const startGamePlay = (toLevel = 1) => {
  globals.levelId = toLevel;
  game.setScene(
    new GamePlay(game, input, globals, {
      onLoose: () => {
        startGameOver();
      },
    }),
    0.75
  );
};

const startGameOver = () => {
  game.setScene(
    new GameOver(game, input, globals, {
      onPlay: () => {
        startGameTitle();
      },
    }),
    0.75
  );
};

export default () => {
  // startGameTitle();
  startGamePlay();
  game.run((dt, t) => {});
};
