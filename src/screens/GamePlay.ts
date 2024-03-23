import {
  Container,
  Camera,
  Vector,
  Entity,
  Game,
  Debugger,
  Cmath,
  World,
} from "../cluster";
import { GAME_CONFIG } from "../config/GameConfig";
import { Background } from "../entities/Background";
import { Bird } from "../entities/Bird";
import { Pipe } from "../entities/Pipe";

export class GamePlay extends Container {
  game: Game;
  camera: Camera;
  background: Background;
  pipes: Container;
  bird: Bird;
  timer = 1;
  spawnRate = 1;

  constructor(game: Game) {
    super();
    this.game = game;
    this.background = new Background();
    this.pipes = new Container();
    this.bird = new Bird(game.keyboard);
    this.camera = new Camera({
      viewSize: { width: GAME_CONFIG.width, height: GAME_CONFIG.height },
      worldSize: { width: GAME_CONFIG.width, height: GAME_CONFIG.height },
    });

    this.camera.add(this.background);
    this.camera.add(this.pipes);
    this.camera.add(this.bird);
    this.add(this.camera);

    const DEBUGGER = new Debugger();
    DEBUGGER.showEntityVelocityLine(this.bird, 0.1);
    DEBUGGER.logEntityVelocity(this.bird);
    this.camera.add(DEBUGGER);
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
    console.log("score");
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

    // edge handling
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
