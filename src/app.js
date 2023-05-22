import GamePlay from "./screens/GamePlay";
import GameTitle from "./screens/GameTitle";
import cluster from "./cluster";

// cluster library
// prettier-ignore
const { 
  MouseControls, 
  KeyControls, 
  Game 
} = cluster;

/**
 * game master
 * configuration
 */
const config = {
  TILE_SIZE: 32,
  GAME_WIDTH: 832,
  GAME_HEIGHT: 640,
};

/**
 * game instance
 */
const game = new Game({
  width: config.GAME_WIDTH,
  height: config.GAME_HEIGHT,
});

/**
 * input instance
 */
const input = {
  key: new KeyControls(),
  mouse: new MouseControls(game.view),
};

export default () => {
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

  game.scene = gameTitle;
  // game.scene = gamePlay;

  game.run((dt, t) => {
    /** running... */
  });
};
