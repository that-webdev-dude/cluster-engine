import {
  Container,
  Entity,
  Camera,
  Game,
  Text,
  Cmath,
  World,
  Vector,
} from "../cluster";
import { GAME_CONFIG } from "../config/GameConfig";
import { Background } from "../entities/Background";
import { Bird } from "../entities/Bird";
import { Pipe } from "../entities/Pipe";

export class GamePlay extends Container {
  gui: Text;
  game: Game;
  camera: Camera;
  scores: number;
  timer: number;
  spawnRate: number;
  background: Background;
  pipes: Container;
  bird: Bird;

  constructor(game: Game) {
    super();
    this.game = game;
    this.scores = 0;
    this.timer = 1;
    this.spawnRate = 1;
    this.background = new Background();
    this.pipes = new Container();
    this.bird = new Bird(game.keyboard);
    this.gui = new Text({
      position: new Vector(GAME_CONFIG.width / 2, 32),
      text: this.scores.toString(),
      style: {
        fill: "white",
        font: `32px ${GAME_CONFIG.fontStyle}`,
        align: "center",
        stroke: "black",
      },
    });
    this.camera = new Camera({
      viewSize: { width: GAME_CONFIG.width, height: GAME_CONFIG.height },
      worldSize: { width: GAME_CONFIG.width, height: GAME_CONFIG.height },
    });

    this.camera.add(this.background);
    this.camera.add(this.pipes);
    this.camera.add(this.bird);
    this.camera.add(this.gui);
    this.add(this.camera);
  }

  spawnPipes() {
    const gapHeight = 200;
    const gapPosition = Cmath.rand(100, GAME_CONFIG.height - 300);
    const pipe1 = new Pipe(new Vector(GAME_CONFIG.width, 0), gapPosition);
    const pipe2 = new Pipe(
      new Vector(GAME_CONFIG.width, gapPosition + gapHeight),
      GAME_CONFIG.height - gapPosition - gapHeight
    );
    this.pipes.add(pipe1);
    this.pipes.add(pipe2);
  }

  score() {
    this.scores += 0.5;
    this.gui.text = this.scores.toString();
  }

  public update(dt: number, t: number): void {
    super.update(dt, t);

    const { bird, pipes } = this;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.spawnRate;
      this.spawnPipes();
    }

    this.forEach((entity) => World.reposition(entity as Entity, dt));

    pipes.forEach((pipe: Pipe) => {
      if (World.detectRectVsRectCollision(bird, pipe)) {
        this.game.setScene("gameOver");
      }
      if (bird.center.x > pipe.center.x && !pipe.scored) {
        pipe.scored = true;
        this.score();
      }
      if (World.offscreen(pipe, GAME_CONFIG.width, GAME_CONFIG.height)) {
        pipe.dead = true;
      }
    });

    if (World.hitScreen(this.bird, GAME_CONFIG.width, GAME_CONFIG.height)) {
      World.screenContain(this.bird, GAME_CONFIG.width, GAME_CONFIG.height);
    }
  }
}
