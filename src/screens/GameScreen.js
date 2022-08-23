import Container from "../cluster/core/Container";
import entity from "../cluster/utils/entity";
import Pickup from "../entities/Pickup";
import Player from "../entities/Player";
import Bat from "../entities/Bat";
import Level from "../levels/Level";
import Totem from "../entities/Totem";
import Bullet from "../entities/Bullet";
import Ghost from "../entities/Ghost";
import TileSprite from "../cluster/core/TileSprite";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const { width, height } = game;

    // level
    const level = new Level(width, height);

    // player
    const player = new Player(controller, level);

    // pickups
    const pickups = new Container();

    // baddies
    const baddies = new Container();

    // init
    this.level = this.add(level);
    this.pickups = this.add(pickups);
    this.player = this.add(player);
    this.baddies = this.add(baddies);
    this.totem = this.add(
      new Totem(this.player, () => {
        this.fireBullet();
      })
    );
    this.totem.position = this.level.findFreeSpot();

    this.populate();
  }

  fireBullet() {
    const bullet = this.add(new Bullet());
    bullet.position = { x: this.totem.position.x, y: this.totem.position.y };

    let angleToPlayer = entity.angle(this.player, bullet);
    bullet.pivot = { x: 28, y: 28 };
    bullet.angle = (180 / Math.PI) * angleToPlayer + 90;
    bullet.direction = {
      x: Math.sin(angleToPlayer),
      y: Math.cos(angleToPlayer),
    };
    this.baddies.add(bullet);
  }

  setPickups() {
    const { pickups, level } = this;
    for (let i = 0; i < 5; i++) {
      const pickup = pickups.add(new Pickup());
      pickup.position = level.findFreeSpot();
    }
  }

  setEnemies() {
    const { player, baddies, level } = this;
    // bats
    for (let i = 0; i < 3; i++) {
      const bat = baddies.add(new Bat());
      bat.position = level.findFreeSpot();
      bat.waypoint = level.findFreeSpot();
      bat.setWaypoint = () => {
        return level.findFreeSpot();
      };
    }

    // ghosts
    for (let i = 0; i < 1; i++) {
      const ghost = baddies.add(new Ghost());
      ghost.position = level.findFreeSpot();
      // ghost.waypoints = level.findPath(ghost, player);
      // ghost.setWaypoints = () => {
      //   return level.findPath(ghost, player);
      // };
    }
  }

  populate() {
    this.setPickups();
    this.setEnemies();
  }

  async update(dt, t) {
    super.update(dt, t);
    const { player, baddies, pickups } = this;

    // collision detection player - enemies
    baddies.children.forEach((enemy) => {
      entity.hit(player, enemy, () => {
        // enemy.dead = true;
        // GAE OVER
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
