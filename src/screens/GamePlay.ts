import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";
import {
  Container,
  Camera,
  Vector,
  State,
  Scene,
  Game,
  Text,
  Dialog,
  Entity,
} from "../ares";
import PauseDialog from "../dialogs/PauseDialog";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import Goal from "../entities/Goal";

// GUI components into a separate layer
const { width, fontStyle } = GAME_CONFIG;
class GUI extends Container {
  private _timerText = new Text({
    text: "",
    align: "center",
    fill: "black",
    font: `20px ${fontStyle}`,
    position: new Vector(width / 2, 32),
  });

  constructor() {
    super();
    this.add(this._timerText);
  }

  public update(dt: number, t: number): void {
    this._timerText.text = `${Math.floor(GAME_GLOBALS.elapsedTime) + 1}`;
  }
}

// gameplay states
enum STATES {
  play,
  pause,
}

class GamePlay extends Scene {
  static playerSpeedX = 250;
  static playerSpeedY = 250;

  state: State<STATES>;
  camera: Camera;
  player: Player;
  enemy: Enemy;
  goal: Goal;
  dialog: Dialog | null = null;

  constructor(
    game: Game,
    transitions: {
      toNext: () => void;
      toFirst: () => void;
    }
  ) {
    const { width, height } = game;
    super(game, transitions);
    this.dialog = null;
    this.state = new State(STATES.play);
    this.player = new Player(game.keyboard, game.gamepad);
    this.enemy = new Enemy();
    this.goal = new Goal();
    this.camera = new Camera({
      worldSize: { width, height },
      viewSize: { width, height },
      subject: this.player,
    });

    this.camera.add(this.player);
    this.camera.add(this.enemy);
    this.camera.add(this.goal);
    this.camera.add(new GUI());

    this.add(this.camera);
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);
    // game win if hit the goal
    Entity.hit(this.player, this.goal, () => {
      GAME_GLOBALS.isWin = true;
      this.transitions.toNext();
    });

    // game loose if hit the enemy
    Entity.hit(this.player, this.enemy, () => {
      GAME_GLOBALS.isWin = false;
      this.transitions.toNext();
    });

    GAME_GLOBALS.elapsedTime += dt;
  }

  private _updateGamePause(dt: number, t: number): void {
    if (this.game.keyboard.key("Enter")) {
      if (this.dialog) {
        this.dialog.dead = true;
        this.state.set(STATES.play);
        this.game.keyboard.active = false;
      }
    }
    if (this.game.keyboard.key("Escape")) {
      if (this.dialog) {
        this.dialog.dead = true;
        this.transitions.toFirst();
        this.game.keyboard.active = false;
      }
    }
  }

  update(dt: number, t: number): void {
    this.state.update(dt);
    switch (this.state.get()) {
      // PLAYING STATE
      case STATES.play:
        this._updateGamePlay(dt, t);
        if (this.game.keyboard.pause) {
          this.game.keyboard.active = false;
          this.state.set(STATES.pause);
        }
        break;

      // PAUSED STATE
      case STATES.pause:
        if (this.state.first) {
          this.dialog = new PauseDialog(this.game);
          this.camera.add(this.dialog);
        }
        this._updateGamePause(dt, t);
        break;
    }
  }
}

export default GamePlay;
