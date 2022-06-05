import { Engine } from "./cluster";

export default () => {
  // game setup
  const canvas = document.querySelector("#display");
  canvas.height = 640;
  canvas.width = 832;
  const ctx = canvas.getContext("2d");
  ctx.globalAlpha = 0.02;
  ctx.fillStyle = "#000";

  const gameLoop = new Engine(
    // game update logic
    () => {
      ctx.save();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";

      const y = Math.random() * canvas.height;
      const x = Math.random() * canvas.width;
      const radius = Math.random() * 20;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    // game rendering
    () => {}
  );

  // start
  gameLoop.start();
};
