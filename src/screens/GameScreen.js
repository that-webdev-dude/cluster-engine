import Screen from "./Screen";
import cluster from "../cluster";
const { Camera, Rect, Vector } = cluster;

class Player extends Rect {
  constructor(input) {
    super({
      width: 50,
      height: 50,
      style: { fill: "red" },
    });

    this.input = input;
    this.speed = 400;
    this.position = new Vector();
  }

  update(dt, t) {
    const { input, position } = this;
    if (input.key.x || input.key.y) {
      position.x += input.key.x * this.speed * dt;
      position.y += input.key.y * this.speed * dt;
    }
  }
}

class Spiral {
  constructor(position = new Vector()) {
    const e = document.createElement("canvas");
    e.width = 100;
    e.height = 100;
    const c = e.getContext("2d");
    c.fillStyle = "red";
    c.fillRect(0, 0, 100, 100);

    this.width = 200;
    this.height = 200;
    this.position = position;
    this.canvas = e;
  }
}

class GameScreen extends Screen {
  constructor(game, input) {
    super(game, input);
    const spiral = new Spiral(new Vector(100, 100));
    const player = new Player(input);
    const camera = new Camera(player, game.view);

    camera.add(player);
    camera.add(spiral);

    this.player = player;
    this.camera = this.add(camera);
  }

  update(dt, t) {
    super.update(dt, t);
    // ...
  }
}

export default GameScreen;
