import cluster from "./cluster";
import GamePlay from "./screens/GamePlay";
import GameTitle from "./screens/GameTitle";
import GameOver from "./screens/GameOver";
import GameWin from "./screens/GameWin";

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
  timer: 15,
  levelId: 1,
  scores: 0,
  lives: 3,
  spawns: null,
  noLevels: 2,
});
let globals = defaults();

// game screens!
function startGameTitle() {
  globals = defaults();
  game.setScene(
    new GameTitle(game, input, globals, {
      onCreate: () => {},
      onExit: () => {
        startGamePlay(globals.levelId, globals.spawn);
      },
    })
  );
}

function startGamePlay(toLevel, spawns) {
  globals.levelId = toLevel;
  globals.spawns = spawns;
  game.setScene(
    new GamePlay(game, input, globals, {
      onWin: startGameWin,
      onNext: startGamePlay,
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

function startGameWin() {
  game.setScene(
    new GameWin(game, input, globals, {
      onExit: startGameTitle,
    })
  );
}

export default () => {
  startGameTitle();
  game.run();
};
