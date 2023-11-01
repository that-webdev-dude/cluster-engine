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
  title: "Shmup!",
  height: 640,
  width: 832,
});

const input = {
  mouse: new MouseControls(game.view),
  keys: new KeyControls(),
};

const defaults = () => ({
  levelID: 1,
  scores: 0,
  lives: 3,
  timer: 40,
});
let globals = defaults();

const startGameTitle = () => {
  globals = defaults();
  game.setScene(
    new GameTitle(game, input, globals, {
      onPlay: () => {
        startGamePlay(globals.levelID);
      },
    }),
    0.5
  );
};
const startGamePlay = (toLevel) => {
  globals.levelID = toLevel;
  game.setScene(
    new GamePlay(game, input, globals, {
      onLoose: () => {
        startGameOver();
      },
    }),
    0.5
  );
};
const startGameOver = () => {
  game.setScene(
    new GameOver(game, input, globals, {
      onPlay: () => {
        startGameTitle();
      },
    }),
    0.5
  );
};

export default () => {
  startGameTitle();
  game.run((dt, t) => {});
};

// Add sound effects and background music.
// Test and debug the game.
// Optimize the game for performance.
// Deploy the game to a web server.
