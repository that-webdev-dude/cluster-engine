import GameScreen from "./screens/GameScreen";
import cluster from "./cluster";

// cluster instances
// prettier-ignore
const {
  MouseControls,
  KeyControls,
  Game 
} = cluster;

const game = new Game({
  title: "New Game",
  height: 640,
  width: 832,
});

const input = {
  mouse: new MouseControls(),
  keys: new KeyControls(),
};

const gameScreen = new GameScreen(game, input);

export default () => {
  game.setScene(gameScreen);
  game.run((dt, t) => {
    // ...
  });
};
