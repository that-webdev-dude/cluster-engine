import { Engine } from "./cluster";
import { KeyControls } from "./cluster";
import { MouseControls } from "./cluster";

export default () => {
  // game setup
  const canvas = document.querySelector("#display");
  const ctx = canvas.getContext("2d");
  canvas.height = 640;
  canvas.width = 832;

  const mouse = new MouseControls(canvas);
  let y = canvas.height / 2;
  let x = canvas.width / 2;
  let color = 0;

  const gameLoop = new Engine(
    // game logic
    (dt) => {
      x = mouse.position.x;
      y = mouse.position.y;
      if (!mouse.isDown) color += 10;
      if (color > 360) color -= 360;
      ctx.fillStyle = `hsl(${color}, 50%, 50%)`;
      ctx.fillRect(x, y, 50, 50);
      mouse.update();
    },
    // game rendering
    () => {}
  );

  // start
  gameLoop.start();
};
