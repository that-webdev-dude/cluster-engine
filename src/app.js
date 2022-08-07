import cluster from "./cluster/index.js";

import Cheese from "./entities/Cheese.js";
import Mouse from "./entities/Mouse.js";
import math from "./cluster/utils/math.js";

const { Game, KeyControls } = cluster;

const relocate = (e, gameW, gameH) => {
  const { position } = e;
  position.x = math.rand(gameW);
  position.y = math.rand(gameH);
};

export default () => {
  const controller = new KeyControls();
  const game = new Game({
    width: 640,
    height: 320,
  });

  const m = new Mouse(controller);
  const c = new Cheese();

  game.scene.add(m);
  game.scene.add(c);

  relocate(m, game.width, game.height);
  relocate(c, game.width, game.height);

  game.run(() => {
    if (
      // bounding box collision
      m.position.x + m.width >= c.position.x &&
      m.position.x <= c.position.x + c.width &&
      m.position.y + m.height >= c.position.y &&
      m.position.y <= c.position.y + c.height
    ) {
      // hit
      relocate(c, game.width, game.height);
    }
  });
};
