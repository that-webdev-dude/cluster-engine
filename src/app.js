import cluster from "./cluster";

// cluster instances
// prettier-ignore
const { 
  MouseControls,
  KeyControls, 
  Game 
} = cluster;

const game = new Game({
  width: 832,
  height: 640,
});

const input = {
  mouse: new MouseControls(),
  key: new KeyControls(),
};

export default () => {
  game.run(() => {
    console.log("...running");
  });
};
