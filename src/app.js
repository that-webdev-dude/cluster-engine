import GameTitle from "./screens/GameTitle";
import GamePlay from "./screens/GamePlay";
import GameOver from "./screens/GameOver";
import GameTest from "./screens/GameTest"; // game test
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
  timer: 120,
});
let globals = defaults();

const startGameTest = () => {
  game.setScene(new GameTest(game, input, globals, {}), 0);
}; //`game test
const startGameTitle = () => {
  globals = defaults();
  game.setScene(
    new GameTitle(game, input, globals, {
      onPlay: () => {
        startGamePlay(globals.levelID);
      },
    }),
    0.75
  );
};
const startGamePlay = (toLevel) => {
  globals.levelID = toLevel;
  game.setScene(
    new GamePlay(game, input, globals, {
      onLoose: () => {
        // startGameOver();
        startGamePlay(); // DELETE THIS AND UNCOMMENT startGameOver() TO ENABLE GAME OVER SCREEN
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
  // startGameTest(); //`game test
  game.run((dt, t) => {});
};

// Test and debug the game.
// Optimize the game for performance.
// Deploy the game to a web server.
