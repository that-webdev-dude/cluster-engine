import Container from "../cluster/core/Container";
import entity from "../cluster/utils/entity";
import Pickup from "../entities/Pickup";
import Player from "../entities/Player";
import Level from "../levels/Level";

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

    // init
    this.level = this.add(level);
    this.pickups = this.add(pickups);
    this.player = this.add(player);

    this.populate();
  }

  populate() {
    const { pickups, level } = this;
    for (let i = 0; i < 5; i++) {
      const pickup = pickups.add(new Pickup());
      pickup.position = level.findFreeSpot();
    }
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
      this.populate();
    }
  }
}

export default GameScreen;
