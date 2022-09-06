import Camera from "../cluster/core/Camera";
import Container from "../cluster/core/Container";
import Player from "../entities/Player";
import Pickup from "../entities/Pickup";
import Level from "../levels/Level";
import Totem from "../entities/Totem";
import Bullet from "../entities/Bullet";
import Bat from "../entities/Bat";

import entity from "../cluster/utils/entity";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const level = new Level();
    const player = new Player(controller, level);

    const totems = new Container();
    const enemies = new Container();
    const pickups = new Container();

    const camera = new Camera(
      player,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );
    camera.add(level);
    camera.add(player);
    camera.add(pickups);
    camera.add(totems);
    camera.add(enemies);
    this.add(camera);

    this.level = level;
    this.player = player;
    this.camera = camera;
    this.pickups = pickups;
    this.enemies = enemies;
    this.totems = totems;

    this.init();
  }

  fireBullet(totemPosition) {
    const { player, enemies } = this;
    const bullet = this.add(new Bullet());
    bullet.position.copy(totemPosition);
    bullet.pivot = { x: 24, y: 24 };

    let angleToPlayer = entity.angle(player, bullet);
    bullet.angle = (180 / Math.PI) * angleToPlayer + 90;
    bullet.direction = {
      x: Math.sin(angleToPlayer),
      y: Math.cos(angleToPlayer),
    };
    enemies.add(bullet);
  }

  init() {
    const { player, pickups, totems, enemies, level } = this;
    const { spawns } = this.level;

    player.position.set(spawns.player.x, spawns.player.y);

    spawns.pickups.map((spawn) => {
      const pickup = new Pickup();
      pickup.position.copy(spawn);
      pickups.add(pickup);
    });

    spawns.totems.map((spawn) => {
      const totem = new Totem(player, () => {});
      totem.position.copy(spawn);
      totem.fire = () => {
        this.fireBullet(totem.position);
      };
      totems.add(totem);
    });

    spawns.bats.forEach((spawn) => {
      const bat = new Bat(player);
      bat.position.copy(spawn);
      bat.waypoint = level.findFreeSpot();
      bat.setWaypoint = (targetEntity = null) => {
        if (targetEntity) {
          return player.position;
        } else {
          return level.findFreeSpot();
        }
      };
      enemies.add(bat);
    });
  }

  update(dt, t) {
    super.update(dt, t);
    const { player, pickups, enemies } = this;

    enemies.children.forEach((enemy) => {
      entity.hit(player, enemy, () => {
        enemy.dead = true;
        // GAME OVER
        console.log("GAME OVER");
      });
    });

    pickups.children.forEach((pickup) => {
      entity.hit(player, pickup, () => {
        pickup.dead = true;
      });
    });
  }
}

export default GameScreen;
