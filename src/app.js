import GamePlay from "./screens/GamePlay";
import GameTitle from "./screens/GameTitle";
import cluster from "./cluster";

// cluster library
// prettier-ignore
const { 
  MouseControls, 
  KeyControls, 
  Assets,
  Game,
} = cluster;

// game configuration
const config = {
  GAME_WIDTH: 832,
  GAME_HEIGHT: 640,
};

// game instance
const game = new Game({
  width: config.GAME_WIDTH,
  height: config.GAME_HEIGHT,
});

// input instance
const input = {
  key: new KeyControls(),
  mouse: new MouseControls(game.view),
};

// game screens
const gameTitle = new GameTitle(game, input, {
  onEnter: () => {},
  onExit: () => {
    game.setScene(gamePlay, 1);
  },
});

const gamePlay = new GamePlay(game, input, {
  onEnter: () => {},
  onExit: () => {},
});

// run
export default () => {
  game.scene = gameTitle;
  game.run((dt, t) => {
    /** running... */
  });
};
