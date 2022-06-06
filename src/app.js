import cluster from "./cluster/index.js";
const { CanvasRenderer } = cluster;
const { Container } = cluster;
const { Engine } = cluster;
const { Text } = cluster;

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
  message.update = function (dt) {
    this.position.x += 0.25 * dt;
    if (this.position.x > 1032) {
      this.position.x = -232;
    }
  };

  const scene = new Container();
  scene.add(message);

  const gameLoop = new Engine(
    (dt) => {
      scene.update(dt);
    },
    () => {
      renderer.render(scene);
    }
  );

  gameLoop.start();
};
