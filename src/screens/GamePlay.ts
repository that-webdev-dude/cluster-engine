import { Container, Scene, Camera, Cmath, Pool } from "../ares";
import Player from "../entities/Player";
import Bullet from "../entities/Bullet";

class GamePlay extends Scene {
  private bulletPool: Pool;
  private bullets: Container;
  private player: Player;
  private camera: Camera;

  constructor(game: any) {
    super(game);
    const bulletPool = new Pool(() => new Bullet());
    const bullets = new Container();
    const player = new Player({ input: game.keyboard });
    const camera = new Camera({
      viewSize: { width: game.width, height: game.height },
      worldSize: { width: game.width, height: game.height },
      subject: player,
    });

    this.bulletPool = bulletPool;
    this.bullets = bullets;
    this.player = player;
    this.camera = camera;

    camera.add(bullets);
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
      const bullet = this.bulletPool.next();
      bullet.position.x = player.position.x + player.width;
      bullet.position.y = player.position.y + player.height / 2;
      this.bullets.add(bullet);
      // const bullets = player.fire(() => {});
      // if (bullets) {
      //   bullets.forEach((bullet) => {
      //     camera.add(bullet);
      //   });
      // }
    }
  }
}

export default GamePlay;
