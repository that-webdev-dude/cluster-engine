import Container from "../cluster/core/Container";
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
    this.populate(pickups, level);

    // init
    this.add(level);
    this.add(player);
    this.add(pickups);
  }

  populate(pickups, level) {
    for (let i = 0; i < 5; i++) {
      const pickup = new Pickup();
      pickups.add(pickup);
      pickup.position = level.findFreeSpot();
    }
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default GameScreen;
