import Squizzball from "./entities/Squizzball.js";
import cluster from "./cluster/index.js";
const { Game, Container, MouseControls, math } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // controller
  const mouse = new MouseControls(game.renderer.view);

  // game objects
  const squizzballs = game.scene.add(new Container());
  for (let i = 0; i < 1; i++) {
    const squizzball = squizzballs.add(new Squizzball());
    squizzball.position.x = math.rand(width - 16);
    squizzball.position.y = math.rand(height - 16);
  }

  // game logic
  game.run((dt, t) => {
    // wrap the squizzballs on the screen
    squizzballs.map((s) => {
      if (s.position.x > width) {
        s.position.x = -32;
        s.speed *= 1.05;
      }

      // collisions
      if (mouse.isPressed && math.distance(s.position, mouse.position) < 16) {
        if (s.speed > 0) {
          s.speed = 0;
        } else {
          s.dead = true;
        }
      }
    });

    // mouse reset
    mouse.update();
  });
};
