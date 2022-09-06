import Camera from "../cluster/core/Camera";
import Container from "../cluster/core/Container";
import Player from "../entities/Player";
import Pickup from "../entities/Pickup";
import Level from "../levels/Level";
import entity from "../cluster/utils/entity";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const level = new Level();
    const player = new Player(controller, level);
    const pickups = new Container();

    const camera = new Camera(
      player,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );
    camera.add(level);
    camera.add(player);
    camera.add(pickups);
    this.add(camera);

    this.level = level;
    this.player = player;
    this.camera = camera;
    this.pickups = pickups;

    this.init();
  }

  init() {
    const { player, pickups } = this;
    const { spawns } = this.level;

    player.position.set(spawns.player.x, spawns.player.y);

    spawns.pickups.map((pickupPosition) => {
      const { x, y } = pickupPosition;
      const pickup = new Pickup();
      pickup.position.set(x, y);
      pickups.add(pickup);
    });
  }

  update(dt, t) {
    super.update(dt, t);

    const { player, pickups } = this;
    pickups.children.forEach((pickup) => {
      entity.hit(player, pickup, () => {
        pickup.dead = true;
      });
    });
  }
}

export default GameScreen;
