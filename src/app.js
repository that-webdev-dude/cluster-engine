import cluster from "./cluster/index.js";
import Squizz from "./entities/Squizz.js";
import Baddie from "./entities/Baddie.js";
import Level from "./levels/Level";
import Container from "./cluster/core/Container.js";

const { Game, KeyControls, Camera, math, entity } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // controller
  const controller = new KeyControls();

  // game objects
  const squizz = new Squizz(controller);
  const level = new Level(width * 2, height * 2);
  const camera = new Camera(
    squizz,
    { width, height },
    { width: level.width, height: level.height }
  );

  function addBaddies(level) {
    const baddies = new Container();
    // horizontal
    for (let i = 0; i <= 4; i++) {
      const baddie = new Baddie(32 * math.rand(1, 3), 0);
      baddie.position = { x: -32 * 3, y: math.rand(0, level.height / 32) * 32 };
      baddie.frame = { x: 0, y: 0 };
      baddies.add(baddie);
    }

    // vertical
    for (let i = 0; i <= 4; i++) {
      const baddie = new Baddie(0, 32 * math.rand(1, 3));
      baddie.position = { x: math.rand(0, level.width / 32) * 32, y: -32 * 3 };
      baddie.frame = { x: 1, y: 1 };
      baddies.add(baddie);
    }

    return baddies;
  }

  const baddies = addBaddies(level);

  // game level
  game.scene.add(camera);
  camera.add(level);
  camera.add(squizz);
  camera.add(baddies);

  // game logic
  game.run((dt, t) => {
    // update the squizz position
    const {
      bounds: { top, right, bottom, left },
    } = level;
    squizz.position.x = math.clamp(squizz.position.x, left, right);
    squizz.position.y = math.clamp(squizz.position.y, top, bottom);

    // check for the squizz ground covered
    const ground = level.checkGround(entity.center(squizz));
    if (ground === "cleared") squizz.dead = true;

    baddies.map((b) => {
      // baddies screenwrap
      if (b.position.x > level.width) {
        b.position = { x: -32, y: math.rand(0, level.height / 32) * 32 };
        b.xSpeed = 32 * math.rand(1, 4);
      }
      if (b.position.y > level.height) {
        b.position = { y: -32, x: math.rand(0, level.height / 32) * 32 };
        b.ySpeed = 32 * math.rand(1, 4);
      }

      // squizz baddie collision
      if (entity.distance(squizz, b) < 32) {
        squizz.dead = true;
      }
    });
  });
};
