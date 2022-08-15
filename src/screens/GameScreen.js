import Container from "../cluster/core/Container";
import entity from "../cluster/utils/entity";
import Pickup from "../entities/Pickup";
import Player from "../entities/Player";
import Bat from "../entities/Bat";
import Level from "../levels/Level";
import Bullet from "../entities/Bullet";

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

    // enemies: bats
    const bats = new Container();

    // init
    this.level = this.add(level);
    this.pickups = this.add(pickups);
    this.player = this.add(player);
    this.bats = this.add(bats);

    this.bullet = this.add(new Bullet());
    this.bullet.position = this.level.findFreeSpot();
    let angleToPlayer = entity.angle(this.player, this.bullet);
    this.bullet.direction = {
      x: Math.sin(angleToPlayer),
      y: Math.cos(angleToPlayer),
    };

    this.populate();
  }

  setPickups() {
    const { pickups, level } = this;
    for (let i = 0; i < 5; i++) {
      const pickup = pickups.add(new Pickup());
      pickup.position = level.findFreeSpot();
    }
  }

  setBats() {
    const { bats, level } = this;
    for (let i = 0; i < 3; i++) {
      const bat = bats.add(new Bat());
      bat.position = level.findFreeSpot();
      bat.waypoint = level.findFreeSpot();
      bat.setWaypoint = () => level.findFreeSpot();
    }
  }

  populate() {
    this.setPickups();
    this.setBats();
  }

  update(dt, t) {
    super.update(dt, t);
    const { player, pickups } = this;

    // collision detection player - maze walls
    // ...

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
