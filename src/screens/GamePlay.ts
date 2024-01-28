import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";
import {
  Container,
  Camera,
  Vector,
  State,
  Scene,
  Game,
  Rect,
  Text,
  Dialog,
} from "../ares";
import PauseDialog from "../dialogs/PauseDialog";

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
  load,
  play,
  pause,
  loose,
  win,
}

class GamePlay extends Scene {
  static playerSpeedX = 250;
  static playerSpeedY = 250;

  state: State<STATES>;
  camera: Camera;
  player: Rect;
  dialog: Dialog | null = null;

  constructor(
    game: Game,
    transitions: {
      toNext: () => void;
    }
  ) {
    const { width, height } = game;
    super(game, transitions);
    this.dialog = null;
    this.state = new State(STATES.play);
    this.player = new Rect({
      width: 32,
      height: 32,
      fill: "grey",
      position: new Vector(100, 100),
    });
    this.camera = new Camera({
      viewSize: { width, height },
      worldSize: { width, height },
      subject: this.player,
    });

    this.camera.add(this.player);
    this.camera.add(new GUI());

    this.add(this.camera);
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);

    // Game logic goes here
    this.player.position.x += GamePlay.playerSpeedX * dt;
    if (
      this.player.position.x > this.game.width - this.player.width ||
      this.player.position.x < 0
    ) {
      GamePlay.playerSpeedX *= -1;
    }
    this.player.position.y += GamePlay.playerSpeedY * dt;
    if (
      this.player.position.y > this.game.height - this.player.height ||
      this.player.position.y < 0
    ) {
      GamePlay.playerSpeedY *= -1;
    }

    if (GAME_GLOBALS.elapsedTime > 5) {
      GAME_GLOBALS.isWin = true;
      this.transitions.toNext();
    }
    if (!this.state.is([STATES.pause])) {
      if (this.game.keyboard.pause) {
        this.state.set(STATES.pause);
        this.game.keyboard.active = false;
      }
    }

    GAME_GLOBALS.elapsedTime += dt;
  }

  private _updateGamePause(dt: number, t: number): void {
    if (this.state.is([STATES.pause])) {
      if (this.game.keyboard.key("Enter")) {
        if (this.dialog) this.camera.remove(this.dialog);
        this.state.set(STATES.play);
        this.game.keyboard.active = false;
      }
    }
  }

  update(dt: number, t: number): void {
    this.state.update(dt);
    switch (this.state.get()) {
      // LOADING STATE
      case STATES.load:
        break;

      // PLAYING STATE
      case STATES.play:
        this._updateGamePlay(dt, t);
        break;

      // PAUSED STATE
      case STATES.pause:
        if (this.state.first) {
          this.dialog = new PauseDialog(this.game);
          this.camera.add(this.dialog);
        }
        this._updateGamePause(dt, t);
        break;

      // GAME OVER STATE
      case STATES.loose:
        break;

      // GAME WON STATE
      case STATES.win:
        break;
    }

    if (GamePlay.firstFrame) {
      GamePlay.firstFrame = false;
    }
  }
}

export default GamePlay;
