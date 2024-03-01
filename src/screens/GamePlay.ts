import { Camera, State, Scene, Game, Dialog } from "../ares";
import { GAME_CONFIG } from "../config/GameConfig";
import { GAME_GLOBALS } from "../globals/GameGlobals";

// GUI components into a separate layer
// const { width, height, fontStyle } = GAME_CONFIG;
// class GUI extends Container {
//   private _timerText = new Text({
//     text: "",
//     position: new Vector(width / 2, 32),
//     style: {
//       align: "center",
//       fill: "black",
//       font: `20px ${fontStyle}`,
//     },
//   });

//   constructor() {
//     super();
//     this.add(this._timerText);
//   }

//   public update(dt: number, t: number): void {
//     this._timerText.text = `${Math.floor(GAME_GLOBALS.elapsedTime) + 1}`;
//   }
// }

// gameplay states
enum STATES {
  play,
  pause,
}

class GamePlay extends Scene {
  state: State<STATES> = new State(STATES.play);
  dialog: Dialog | null = null;
  camera: Camera;
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
    this.camera = new Camera({
      worldSize: { width, height },
      viewSize: { width, height },
    });
    this.add(this.camera);
  }

  private _updateGamePlay(dt: number, t: number): void {
    super.update(dt, t);
    // const { player, ground, platforms } = this;
    const { mouse } = this.game;

    // ...

    GAME_GLOBALS.elapsedTime += dt;
    mouse.update();
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
      // case STATES.pause:
      //   if (this.state.first) {
      //     this.dialog = new PauseDialog(this.game);
      //     this.camera.add(this.dialog);
      //   }
      //   this._updateGamePause(dt, t);
      //   break;
    }
  }
}

export default GamePlay;
