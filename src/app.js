import cluster from "./cluster/index.js";
import Cheese from "./entities/Cheese.js";
import Mouse from "./entities/Mouse.js";
import math from "./cluster/utils/math.js";
import entity from "./cluster/utils/entity.js";

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

  const mouse = new Mouse(controller);
  const cheese = new Cheese();

  game.scene.add(entity.debug(mouse));
  game.scene.add(entity.debug(cheese));

  relocate(mouse, game.width, game.height);
  relocate(cheese, game.width, game.height);

  game.run(() => {
    entity.hit(mouse, cheese, () => relocate(cheese, game.width, game.height));
  });
};
