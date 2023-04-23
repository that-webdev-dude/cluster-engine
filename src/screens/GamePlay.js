import Level from "../levels/Level";
import Zombie from "../entities/Zombie";
import Player from "../entities/Player";
import Barrel from "../entities/Barrel";
import cluster from "../cluster/index";
import Rect from "../cluster/shapes/Rect";

const { Container, Camera, Vector, ParticleEmitter, entity, math } = cluster;

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
    camera.add(zombies);
    camera.add(barrels);
    this.add(camera);

    this.firstUpdate = true;
    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.input = input;
    this.game = game;

    this.level = level;
    this.camera = camera;
    this.player = player;
    this.bullets = bullets;
    this.zombies = zombies;
    this.barrels = barrels;

    this.initialize();

    // DEBUG CAMERA
    this.camera.add(new Rect({ width: 96, health: 96, style: { stroke: "red" } }));
  }

  initialize() {
    const { player, level, zombies, barrels } = this;

    // zombies spawn only on walkable tiles
    const nZombies = 10;
    for (let z = 0; z < nZombies; z++) {
      let testPosition = null;
      const { tileW, tileH, width, height } = level;
      while (!testPosition) {
        const x = math.rand(tileW, width - 2 * tileW);
        const y = math.rand(tileH + 3 * 32, height - 2 * tileH - 3 * 32);
        const targetTile = level.tileAtPixelPosition(new Vector(x, y + tileH));
        if (!targetTile.frame.walkable) {
          const zombiePosition = new Vector(Math.floor(x), Math.floor(y) - 32);
          zombies.add(new Zombie(player, level, zombiePosition));
          testPosition = true;
        }
      }
    }

    // barrels spawn
    this.barrel = barrels.add(new Barrel(new Vector(32 * 20, 32 * 7 + 2)));
  }

  update(dt, t) {
    super.update(dt, t);
    const { input, player, camera, bullets, zombies, barrels } = this;

    // bullet spawn
    if (input.key.action) {
      const bullet = player.fire(dt);
      if (bullet) {
        bullets.add(bullet);
      }
    }

    // collisions
    bullets.children.forEach((bullet) => {
      // bullet hits zombie
      zombies.children.forEach((zombie) => {
        entity.hit(bullet, zombie, () => {
          const { x: zx, y: zy } = zombie.position;
          const { direction } = player;
          zombie.position.set(zx + 2 * direction, zy);
          zombie.damage(1);
          if (zombie.health === 0) {
            // DEBUG ---
            // splat
            const particleEmitter = camera.add(
              new ParticleEmitter(
                [...Array(20)].map(() => new BloodParticle(player.direction)),
                Vector.from(zombie.position)
              )
            );
            particleEmitter.play();
            // DEBUG ---
          }
          bullet.dead = true;
        });
      });

      // bullet hits barrel
      barrels.children.forEach((barrel) => {
        entity.hit(bullet, barrel, () => {
          barrel.damage(1);
          if (barrel.health === 0) {
            // screen skake & flash
            camera.shake();
            camera.flash(0.75);
          }
          bullet.dead = true;
        });
      });
    });

    // FIRST UPDATE ONLY
    if (this.firstUpdate) {
      this.firstUpdate = false;
    }
  }
}

export default GamePlay;
