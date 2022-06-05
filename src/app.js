import cluster from "./cluster/index.js";
const { Engine, Container, CanvasRenderer, Text } = cluster;

export default () => {
  // game setup
  const width = 832;
  const height = 640;
  const renderer = new CanvasRenderer(width, height);
  document.querySelector("#app").appendChild(renderer.view);

  // game objects
  const message = new Text("The renderer!", {
    font: "16pt 'Press Start 2p'",
    fill: "DarkRed",
    align: "center",
  });
  message.position.x = width / 2;
  message.position.y = height / 2;

  const scene = new Container();
  scene.add(message);

  const gameLoop = new Engine(
    // game logic
    (dt) => {},
    // game rendering
    () => {
      renderer.render(scene);
    }
  );

  // start
  gameLoop.start();
};
