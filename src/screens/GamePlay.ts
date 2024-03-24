import {
  Container,
  Entity,
  Camera,
  Game,
  Text,
  Cmath,
  World,
  Vector,
  Pool,
  Dialog,
  State,
  Sound,
} from "../cluster";
import { GAME_CONFIG } from "../config/GameConfig";
import { Background } from "../entities/Background";
import { Bird } from "../entities/Bird";
import { Pipe } from "../entities/Pipe";
import { PauseDialog } from "../dialogs/PauseDialog";
import { GameOverDialog } from "../dialogs/GameOverDialog";
import ScoreSoundURL from "../sounds/Score.wav";
import HitSoundURL from "../sounds/Hit.wav";

// sounds
const scoreSound = new Sound(ScoreSoundURL, { volume: 0.125 });
const hitSound = new Sound(HitSoundURL);

enum states {
  PLAY,
  PAUSED,
  GAMEOVER,
}

export class GamePlay extends Container {
  gui: Text;
  game: Game;
  camera: Camera;
  scores: number;
  timer: number;
  spawnRate: number;
  background: Background;
  bird: Bird;
  pipes: Container;
  pipePool: Pool<Pipe>;
  dialog: Dialog | null = null;
  private state: State<states> = new State(states.PLAY);

  constructor(game: Game) {
    super();
    this.game = game;
    this.scores = 0;
    this.timer = 1;
    this.spawnRate = 1;
    this.background = new Background();
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

    this.bird = new Bird(game.keyboard);
    this.pipes = new Container();
    this.pipePool = new Pool<Pipe>(
      () => new Pipe(new Vector(0, GAME_CONFIG.width), 0)
    );

    this.camera = new Camera({
      viewSize: { width: GAME_CONFIG.width, height: GAME_CONFIG.height },
      worldSize: { width: GAME_CONFIG.width, height: GAME_CONFIG.height },
    });
    this.camera.add(this.background);
    this.camera.add(this.pipes);
    this.camera.add(this.bird);
    this.camera.add(this.gui);
    this.add(this.camera);

    this.dialog = null;
  }

  spawnPipes() {
    const gapHeight = 200;
    const gapPosition = Cmath.rand(100, GAME_CONFIG.height - 300);
    const pipe1 = this.pipePool.next((pipe) => {
      pipe.position.set(GAME_CONFIG.width, 0);
      pipe.height = gapPosition;
      pipe.scored = false;
      pipe.dead = false;
    });
    const pipe2 = this.pipePool.next((pipe) => {
      pipe.position.set(GAME_CONFIG.width, gapPosition + gapHeight);
      pipe.height = GAME_CONFIG.height - gapPosition - gapHeight;
      pipe.scored = false;
      pipe.dead = false;
    });
    this.pipes.add(pipe1);
    this.pipes.add(pipe2);
  }

  score() {
    this.scores += 0.5;
    this.gui.text = this.scores.toString();
  }

  updateGamePlay(dt: number, t: number) {
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
        hitSound.play();
        this.state.set(states.GAMEOVER);
      }
      if (bird.center.x > pipe.center.x && !pipe.scored) {
        pipe.scored = true;
        scoreSound.play();
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

  public update(dt: number, t: number): void {
    switch (this.state.get()) {
      case states.PLAY:
        this.updateGamePlay(dt, t);
        if (this.game.keyboard.pause) {
          this.state.set(states.PAUSED);
        }
        break;
      case states.PAUSED:
        if (this.state.first) {
          this.dialog = new PauseDialog(() => {
            // this.state.set(states.PLAY);
          });
          this.camera.add(this.dialog);
        }

        if (this.game.keyboard.quit) {
          this.game.setScene("gameTitle");
        }

        if (this.game.keyboard.enter) {
          this.state.set(states.PLAY);
          if (this.dialog !== null) {
            this.camera.remove(this.dialog);
            this.dialog = null;
          }
        }
        break;
      case states.GAMEOVER:
        if (this.state.first) {
          this.dialog = new GameOverDialog(() => {
            // this.state.set(states.PLAY);
          });
          this.camera.add(this.dialog);
        }

        if (this.game.keyboard.enter) {
          if (this.dialog !== null) {
            this.camera.remove(this.dialog);
            this.dialog = null;
          }
          this.game.setScene("gamePlay");
        }

        if (this.game.keyboard.quit) {
          if (this.dialog !== null) {
            this.camera.remove(this.dialog);
            this.dialog = null;
          }
          this.game.setScene("gameTitle");
        }
        break;
    }

    this.state.update(dt);
  }
}
