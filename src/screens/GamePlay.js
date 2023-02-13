import Level from "../levels/Level";
import Enemy from "../entities/Enemy";
import Player from "../entities/Player";
import Bullet from "../entities/Bullet";
import cluster from "../cluster/index";
const { Container, Camera, Vector, entity } = cluster;

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    const gameW = game.width;
    const gameH = game.height;
    const level = new Level(gameW * 2, gameH);
    const player = new Player(input, level);
    const bullets = new Container();
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
    // const weaponA = new Line({
    //   start: new Vector(),
    //   end: this.player.position.clone().add(this.player.weapon.position),
    //   style: { stroke: "black" },
    // });
    // this.add(weaponA);
  }

  update(dt, t) {
    super.update(dt, t);
    const { input, level, player, bullets } = this;

    // bullet spawn
    if (input.key.action) {
      const bullet = player.fire(dt);
      if (bullet) {
        bullets.add(bullet);
      }
    }

    // bullet level collision
    bullets.children.forEach((bullet) => {
      const tilesAtBulletCorners = level.tilesAtCorners(bullet.bounds);
      for (const tile of tilesAtBulletCorners) {
        let hit = false;
        if (!tile.frame.walkable) {
          entity.hit(bullet, tile, () => {
            bullet.dead = true;
            hit = true;
          });
        }
        if (hit) break;
      }
    });

    // FIRST UPDATE ONLY
    if (this.firstUpdate) {
      this.firstUpdate = false;
    }
  }
}

export default GamePlay;
