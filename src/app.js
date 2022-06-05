import { Engine } from "./cluster";
import { KeyControls } from "./cluster";
import { MouseControls } from "./cluster";

export default () => {
  // game setup
  const canvas = document.querySelector("#display");
  const ctx = canvas.getContext("2d");
  canvas.height = 640;
  canvas.width = 832;

  const controls = new KeyControls();

  let y = canvas.height / 2;
  let x = canvas.width / 2;
  let color = 0;

  const gameLoop = new Engine(
    // game logic
    (dt) => {
      x += controls.x;
      y += controls.y;
      if (!controls.action) color += 10;
      if (color > 360) color -= 360;
    },
    // game rendering
    () => {
      ctx.fillStyle = `hsl(${color}, 50%, 50%)`;
      ctx.fillRect(x, y, 50, 50);
    }
  );

  // start
  gameLoop.start();
};
