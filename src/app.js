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
  spawns: null,
});
let globals = defaults();

// game screens!
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
