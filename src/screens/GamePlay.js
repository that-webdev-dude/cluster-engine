import Level from "../levels/Level";
import Player from "../entities/Player";
import cluster from "../cluster/index";
const { Container, Camera, Vector, Text } = cluster;

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    const gameW = game.width;
    const gameH = game.height;
    const level = new Level(gameW * 2, gameH);
    const player = new Player(input, level);
    const enemies = new Container();
    const camera = new Camera(
      player,
      { width: game.width, height: game.height },
      { width: level.width, height: level.height }
    );

    camera.add(level);
    camera.add(player);
    camera.add(enemies);
    this.add(camera);

    this.onEnter = transitions?.onEnter || function () {};
    this.onExit = transitions?.onExit || function () {};
    this.input = input;
    this.game = game;
    this.level = level;
    this.camera = camera;
    this.player = player;
    this.enemies = enemies;

    // debug
    // this.playerVel = this.add(new Text("", { fill: "black" }));
    // this.playerVel.position = new Vector(25, game.height - 50);
    // this.playerPos = this.add(new Text("", { fill: "black" }));
    // this.playerPos.position = new Vector(25, game.height - 25);
  }

  update(dt, t) {
    super.update(dt, t);

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
