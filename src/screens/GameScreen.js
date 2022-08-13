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

    // init
    this.level = this.add(level);
    this.player = this.add(player);
    this.pickups = this.add(pickups);

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
  }
}

export default GameScreen;
