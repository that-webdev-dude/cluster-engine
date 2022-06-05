import cluster from "./cluster/index.js";
const { Engine } = cluster;
const { Container } = cluster;
const { KeyControls } = cluster;
const { MouseControls } = cluster;

export default () => {
  // game setup
  const canvas = document.querySelector("#display");
  const ctx = canvas.getContext("2d");
  canvas.height = 640;
  canvas.width = 832;

  // temp game element
  const player = {
    update: function () {
      console.log("player updated!");
    },
  };

  const scene = new Container();
  scene.add(player);
  scene.update();
  scene.remove(player);

  const gameLoop = new Engine(
    // game logic
    (dt) => {},
    // game rendering
    () => {}
  );

  // start
  gameLoop.start();
};
