import cluster from "./cluster/index.js";
import Squizz from "./entities/Squizz.js";
import Level from "./levels/Level";

const { Game, KeyControls, math } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // controller
  const controller = new KeyControls();

  // game objects
  const squizz = new Squizz(controller);
  const level = new Level(width, height);

  // game level
  game.scene.add(level);
  game.scene.add(squizz);

  // game logic
  game.run((dt, t) => {
    const {
      bounds: { top, right, bottom, left },
    } = level;
    squizz.position.x = math.clamp(squizz.position.x, left, right);
    squizz.position.y = math.clamp(squizz.position.y, top, bottom);

    // console.log(level.mapToPixelPosition({ x: 1, y: 1 }));
  });
};
