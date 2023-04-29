import Level from "../levels/Level";
import Zombie from "../entities/Zombie";
import Player from "../entities/Player";
import Barrel from "../entities/Barrel";
import BloodParticle from "../particles/BloodParticle";
import cluster from "../cluster/index";
import Timer from "../cluster/core/Timer";

const { Container, Camera, Vector, Physics, ParticleEmitter, entity, math, Rect } = cluster;

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

    // DEBUG CAMERA ...
    // this.cameraTracker = this.camera.add(
    //   new Rect({
    //     width: 96,
    //     height: 96,
    //     style: { fill: "transparent", stroke: "yellow" },
    //   })
    // );
    // this.cameraTracker.position = new Vector();
    // DEBUG CAMERA ...
  }

  initialize() {
    const { player, level, zombies, barrels } = this;

    // zombies spawn only on walkable tiles
    const nZombies = 1;
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

    // bullet collisions
    bullets.children.forEach((bullet) => {
      // bullet hits zombie
      zombies.children.forEach((zombie) => {
        entity.hit(bullet, zombie, () => {
          const { x: zx, y: zy } = zombie.position;
          const { direction } = player;
          zombie.position.set(zx + 2 * direction, zy);
          zombie.damage(1);
          if (zombie.health === 0) {
            const particleEmitter = camera.add(
              new ParticleEmitter(
                [...Array(20)].map(() => new BloodParticle(player.direction, "lightGreen")),
                Vector.from(zombie.position)
              )
            );
            particleEmitter.play();
          }
          bullet.dead = true;
        });
      });

      // bullet hits barrel
      barrels.children.forEach((barrel) => {
        entity.hit(bullet, barrel, () => {
          barrel.damage(1);
          if (barrel.health === 0) {
            camera.shake();
            camera.flash(0.75);
          }
          bullet.dead = true;
        });
      });
    });

    // zombie collisions
    zombies.children.forEach((zombie) => {
      entity.hit(zombie, player, () => {
        // player blood splash
        const particleEmitter = camera.add(
          new ParticleEmitter(
            [...Array(5)].map(() => new BloodParticle(zombie.direction, "red")),
            Vector.from(player.position)
          )
        );
        particleEmitter.play();
        // player invincibility blink
        if (!player.isInvincible) player.invincible(0.5);
        // player knockback
        player.knockback(dt, zombie);
        // player damage
        // ...
      });
    });

    // FIRST UPDATE ONLY
    if (this.firstUpdate) {
      this.firstUpdate = false;
    }

    // DEBUG CAMERA ...
    // this.cameraTracker.position.x = camera.subject.position.x - camera.width / 2;
    // this.cameraTracker.position.y = camera.subject.position.y - camera.height / 2;
  }
}

export default GamePlay;
