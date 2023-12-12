import ares, { Container } from "../ares";
import Player from "../entities/Player";

const { Scene, Camera, Cmath } = ares;

class GamePlay extends Scene {
  private player: Player;
  private camera: Container;

  constructor(game: any) {
    super(game);
    const player = new Player({ input: game.keyboard });
    const camera = new Camera({
      viewSize: { width: game.width, height: game.height },
      worldSize: { width: game.width, height: game.height },
      subject: player,
    });

    this.player = player;
    this.camera = camera;

    camera.add(player);
    this.add(camera);
  }

  update(dt: number, t: number) {
    super.update(dt, t);
    const { player, camera, game } = this;

    player.position.x = Cmath.clamp(
      player.position.x,
      24,
      game.width - player.width
    );
    player.position.y = Cmath.clamp(
      player.position.y,
      0,
      game.height - player.height
    );

    if (game.keyboard.action) {
      const bullets = player.fire(() => {});
      if (bullets) {
        bullets.forEach((bullet) => {
          camera.add(bullet);
        });
      }
    }
  }
}

export default GamePlay;
