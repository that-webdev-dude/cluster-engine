import Camera from "../cluster/core/Camera";
import Container from "../cluster/core/Container";
import Player from "../entities/Player";
import Pickup from "../entities/Pickup";
import Level from "../levels/Level";
// import Totem from "../entities/Totem";
// import Bullet from "../entities/Bullet";
import entity from "../cluster/utils/entity";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const level = new Level();
    const player = new Player(controller, level);

    // const totems = new Container();
    // const enemies = new Container();
    const pickups = new Container();

    const camera = new Camera(
      player,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );
    camera.add(level);
    camera.add(player);
    camera.add(pickups);
    // camera.add(totems);
    // camera.add(enemies);
    this.add(camera);

    this.level = level;
    this.player = player;
    this.camera = camera;
    this.pickups = pickups;
    // this.enemies = enemies;
    // this.totems = totems;

    this.init();
  }

  //   fireBullet(totemPosition) {
  //     const { player, enemies } = this;
  //     const bullet = this.add(new Bullet());
  //     bullet.position = totemPosition;
  //     bullet.pivot = { x: 28, y: 28 };

  //     let angleToPlayer = entity.angle(player, bullet);
  //     bullet.angle = (180 / Math.PI) * angleToPlayer + 90;
  //     bullet.direction = {
  //       x: Math.sin(angleToPlayer),
  //       y: Math.cos(angleToPlayer),
  //     };
  //     enemies.add(bullet);
  //   }

  init() {
    const { player, pickups, totems, enemies } = this;
    const { spawns } = this.level;

    player.position.set(spawns.player.x, spawns.player.y);

    spawns.pickups.map((pickupPosition) => {
      const { x, y } = pickupPosition;
      const pickup = new Pickup();
      pickup.position.set(x, y);
      pickups.add(pickup);
    });

    // spawns.totems.map((totemPosition) => {
    //   const { x, y } = totemPosition;
    //   const totem = new Totem(player, () => {});
    //   totem.position.set(x, y);
    //   totem.fire = () => {
    //     this.fireBullet(totem.position);
    //   };
    //   totems.add(totem);
    // });
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
