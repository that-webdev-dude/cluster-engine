import Container from "../cluster/core/Container";
import entity from "../cluster/utils/entity";
import Pickup from "../entities/Pickup";
import Player from "../entities/Player";
import Bat from "../entities/Bat";
import Level from "../levels/Level";
import Totem from "../entities/Totem";
import Bullet from "../entities/Bullet";
import Ghost from "../entities/Ghost";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const { width, height } = game;

    // actors
    const level = new Level(width, height);
    const player = new Player(controller, level);
    const pickups = new Container();
    const baddies = new Container();
    const totem = new Totem(player, () => {
      this.fireBullet();
    });

    // init
    this.level = this.add(level);
    this.pickups = this.add(pickups);
    this.player = this.add(player);
    this.baddies = this.add(baddies);
    this.totem = this.add(totem);
    this.populate();
  }

  fireBullet() {
    const { totem, player, baddies } = this;
    const bullet = this.add(new Bullet());
    bullet.position = { x: totem.position.x, y: totem.position.y };
    bullet.pivot = { x: 28, y: 28 };

    let angleToPlayer = entity.angle(player, bullet);
    bullet.angle = (180 / Math.PI) * angleToPlayer + 90;
    bullet.direction = {
      x: Math.sin(angleToPlayer),
      y: Math.cos(angleToPlayer),
    };
    baddies.add(bullet);
  }

  setPickups() {
    const { pickups, level } = this;
    for (let i = 0; i < 5; i++) {
      const pickup = pickups.add(new Pickup());
      pickup.position = level.findFreeSpot();
    }
  }

  setEnemies() {
    const { totem, baddies, level, player } = this;

    // totem
    totem.position = this.level.findFreeSpot();

    // bats
    for (let i = 0; i < 1; i++) {
      const bat = baddies.add(new Bat(player));
      bat.position = level.findFreeSpot();
      bat.waypoint = level.findFreeSpot();
      bat.setWaypoint = (targetEntity = null) => {
        if (targetEntity) {
          return player.position;
        } else {
          return level.findFreeSpot();
        }
      };
    }

    // ghosts
    for (let i = 0; i < 2; i++) {
      const ghost = baddies.add(new Ghost(level));
      ghost.position = level.findFreeSpot();
      ghost.setPath = () => {
        level.pathAsync(
          ghost,
          player,
          (path) => {
            ghost.path = path.map((tile) => {
              return {
                x: tile.x * level.tileW,
                y: tile.y * level.tileH,
              };
            });
            ghost.waypoint = ghost.path.pop();
          },
          (error) => {
            ghost.path = [level.findFreeSpot()];
          }
        );
      };
    }
  }

  populate() {
    this.setPickups();
    this.setEnemies();
  }

  update(dt, t) {
    super.update(dt, t);
    const { player, baddies, pickups } = this;

    // collision detection player - enemies
    baddies.children.forEach((enemy) => {
      entity.hit(player, enemy, () => {
        enemy.dead = true;
        // GAME OVER
        // console.log("GAME OVER");
      });
    });

    // collision detection player - pickups
    pickups.children.forEach((pickup) => {
      entity.hit(player, pickup, () => {
        pickup.dead = true;
      });
    });

    // pickups repopulation if no more on the map
    if (pickups.children.length <= 0) {
      this.setPickups();
    }
  }
}

export default GameScreen;
