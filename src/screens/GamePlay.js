import Level from "../levels/Level";
import Zombie from "../entities/Zombie";
import Player from "../entities/Player";
import Barrel from "../entities/Barrel";
import cluster from "../cluster/index";
const { Container, Camera, Vector, entity, math } = cluster;

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    const gameW = game.width;
    const gameH = game.height;
    const level = new Level(gameW * 2, gameH);
    const player = new Player(input, level);
    const bullets = new Container();
    const zombies = new Container();
    const barrels = new Container();
    const camera = new Camera(
      player,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );

    camera.add(level);
    camera.add(player);
    camera.add(bullets);
    this.add(camera);

    this.firstUpdate = true;
    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.input = input;
    this.game = game;
    this.level = level;

    this.level = level;
    this.camera = camera;
    this.player = player;
    this.bullets = bullets;

    // DEBUG
    // this.barrel = camera.add(new Barrel(new Vector(32 * 20, 32 * 7 + 2)));
    this.zombies = camera.add(zombies);

    this.initialize();
  }

  initialize() {
    const { player, level } = this;

    // just if the tile is walkable
    // no need to go crazy here
    const nZombies = 5;
    for (let z = 0; z < nZombies; z++) {
      let testPosition = null;
      const { tileW, tileH, width, height } = level;
      while (!testPosition) {
        const x = math.rand(tileW, width - 2 * tileW);
        const y = math.rand(tileH + 3 * 32, height - 2 * tileH - 3 * 32);
        const targetTile = level.tileAtPixelPosition(new Vector(x, y + tileH));
        if (!targetTile.frame.walkable) {
          const zombiePosition = new Vector(Math.floor(x), Math.floor(y) - 32);
          const zombieHealth = math.rand(15, 20);
          // ghive this a variable speed FFS
          const zombieSpeed = math.rand(32, 64);
          this.zombies.add(new Zombie(player, level, zombiePosition, zombieHealth));
          testPosition = true;
        }
      }
    }
  }

  update(dt, t) {
    super.update(dt, t);
    const { input, player, bullets, zombies } = this;

    // bullet spawn
    if (input.key.action) {
      const bullet = player.fire(dt);
      if (bullet) {
        bullets.add(bullet);
      }
    }

    // bullet hits zombie
    bullets.children.forEach((bullet) => {
      zombies.children.forEach((zombie) => {
        entity.hit(bullet, zombie, () => {
          const { x: zx, y: zy } = zombie.position;
          const { direction } = player;
          zombie.position.set(zx + 2 * direction, zy);
          zombie.damage(1);
          bullet.dead = true;
          // zombie loose health
        });
      });
    });

    // bullets.children.forEach((bullet) => {
    //   entity.hit(bullet, zombie, () => {
    //     const { x: zx, y: zy } = zombie.position;
    //     const { direction } = player;
    //     zombie.position.set(zx + 2 * direction, zy);
    //     bullet.dead = true;
    //     // zombie loose health
    //   });
    // });

    // FIRST UPDATE ONLY
    if (this.firstUpdate) {
      this.firstUpdate = false;
    }
  }
}

export default GamePlay;
