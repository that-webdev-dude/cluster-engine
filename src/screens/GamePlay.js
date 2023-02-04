import Level from "../levels/Level";
import Enemy from "../entities/Enemy";
import Player from "../entities/Player";
import cluster from "../cluster/index";
const { Container, Camera, Vector, Text, entity } = cluster;

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    const gameW = game.width;
    const gameH = game.height;
    const level = new Level(gameW * 2, gameH);
    const player = new Player(input, level);
    const enemies = new Container();
    const bullets = new Container();
    const camera = new Camera(
      player,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );

    camera.add(level);
    camera.add(player);
    camera.add(enemies);
    camera.add(bullets);
    this.add(camera);

    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.input = input;
    this.game = game;
    this.level = level;
    this.camera = camera;
    this.player = player;
    this.bullets = bullets;
    this.enemies = enemies;

    this.initialize();

    // debug
    // this.playerVel = this.add(new Text("", { fill: "black" }));
    // this.playerVel.position = new Vector(25, game.height - 50);
    // this.playerPos = this.add(new Text("", { fill: "black" }));
    // this.playerPos.position = new Vector(25, game.height - 25);
  }

  initialize() {
    for (let i = 0; i < 1; i++) {
      this.enemies.add(new Enemy(this.player, this.level));
    }
  }

  update(dt, t) {
    super.update(dt, t);

    // prettier-ignore
    const {
      input,
      player,
      bullets,
      level,
    } = this

    if (input.key.action) {
      const bullet = player.fire(dt);
      if (bullet) {
        bullets.add(bullet);
      }
    }

    // console.log(bullets.children);
    bullets.children.forEach((bullet) => {
      const { width, height, position } = bullet;
      const { x, y } = position;

      // bullets out of bounds
      if (
        x >= level.width + width * 2 ||
        x <= -width * 2 ||
        y >= level.height + height * 2 ||
        y <= -height * 2
      ) {
        bullet.dead = true;
        return;
      }
    });

    // debug
    // if (this.playerVel) {
    //   let velx = Math.floor(this.player.velocity.x);
    //   let vely = Math.floor(this.player.velocity.y);
    // this.playerVel.text = `velx: ${velx} - vely: ${vely}`;
    // let posx = Math.floor(this.player.position.x);
    // let posy = Math.floor(this.player.position.y);
    // this.playerPos.text = `posx: ${posx} - posy: ${posy}`;
    // }
  }
}

export default GamePlay;
