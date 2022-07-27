import Camera from "../cluster/core/Camera";
import Container from "../cluster/core/Container";
import entity from "../cluster/utils/entity";
import math from "../cluster/utils/math";
import Baddie from "../entities/Baddie";
import Squizz from "../entities/Squizz";
import Level from "../levels/Level";

class GameScreen extends Container {
  constructor(game, controller, onGameOver = () => {}) {
    super();
    const level = new Level(game.width * 2, game.height * 2);
    const squizz = new Squizz(controller);
    squizz.position = {
      x: 0,
      y: 0,
    };

    const baddies = this.addBaddies(level);

    const camera = new Camera(
      squizz,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );

    camera.add(level);
    camera.add(squizz);
    camera.add(baddies);
    this.add(camera);

    this.level = level;
    this.squizz = squizz;
    this.camera = camera;
    this.baddies = baddies;
    this.onGameOver = onGameOver;
  }

  addBaddies(level) {
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

  update(dt, t) {
    super.update(dt, t);
    const { squizz, level, baddies } = this;

    // update the squizz position
    const {
      bounds: { top, right, bottom, left },
    } = level;
    squizz.position.x = math.clamp(squizz.position.x, left, right);
    squizz.position.y = math.clamp(squizz.position.y, top, bottom);

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

    // check for the squizz ground covered
    const ground = level.checkGround(entity.center(squizz));
    if (ground === "cleared") {
      squizz.dead = true;
    }

    if (squizz.dead) this.onGameOver();
  }
}

export default GameScreen;
