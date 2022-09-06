import Camera from "../cluster/core/Camera";
import Container from "../cluster/core/Container";
import Player from "../entities/Player";
import Level from "../levels/Level";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const level = new Level();
    const player = new Player(controller, level);

    const camera = new Camera(
      player,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );
    camera.add(level);
    camera.add(player);
    this.add(camera);

    this.level = level;
    this.player = player;
    this.camera = camera;

    this.init();
  }

  init() {
    const { spawns } = this.level;
    this.player.position.set(spawns.player.x, spawns.player.y);
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default GameScreen;
