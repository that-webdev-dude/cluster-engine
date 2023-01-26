import Level from "../levels/Level";
import Player from "../entities/Player";
import cluster from "../cluster/index";
const { Container, Vector, Text } = cluster;

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.game = game;
    this.input = input;
    this.onExit = transitions?.onExit || function () {};
    this.onEnter = transitions?.onEnter || function () {};

    // level
    this.level = this.add(new Level(game.width * 3, game.height));
    this.player = this.add(new Player(this.input));

    // debug
    this.playerVel = this.add(new Text("", { fill: "black" }));
    this.playerVel.position = new Vector(25, game.height - 50);
    this.playerPos = this.add(new Text("", { fill: "black" }));
    this.playerPos.position = new Vector(25, game.height - 25);
  }

  update(dt, t) {
    super.update(dt, t);

    // debug
    if (this.playerVel) {
      let velx = Math.floor(this.player.velocity.x);
      let posx = Math.floor(this.player.position.x);
      let posy = Math.floor(this.player.position.y);
      this.playerVel.text = `velx: ${velx}`;
      this.playerPos.text = `posx: ${posx} - posy: ${posy}`;
    }

    if (this.input.key.action) {
      const tile = this.level.tileAtPixelPosition(this.player.position);
    }

    // if (this.input.mouse.isPressed) {
    //   this.onExit();
    // }

    // this.input.mouse.update();
  }
}

export default GamePlay;
