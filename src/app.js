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

  const a = new Mouse(controller);
  const b = new Cheese();

  game.scene.add(a);
  game.scene.add(b);

  relocate(a, game.width, game.height);
  relocate(b, game.width, game.height);

  game.run(() => {
    if (
      // bounding box collision
      a.position.x + a.width >= b.position.x &&
      a.position.x <= b.position.x + b.width &&
      a.position.y + a.height >= b.position.y &&
      a.position.y <= b.position.y + b.height
    ) {
      // hit
      relocate(b, game.width, game.height);
    }
  });
};
