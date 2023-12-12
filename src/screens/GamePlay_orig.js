import Screen from "./Screen";
import cluster from "../cluster";
import DialogPause from "../dialogs/DialogPause";

// prettier-ignore
const { 
  State,
  Rect,
} = cluster;

const states = {
  PLAYING: 0,
  PAUSED: 1,
};

class GamePlay extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);

    const background = new Rect({
      height: game.height,
      width: game.width,
      style: { fill: "black" },
    });

    this.state = new State(states.PLAYING);
    this.dialog = null;
    this.background = this.add(background);
  }

  /**
   * updates the gameplay.
   * @function
   * @memberof GamePlay
   * @param {*} dt
   * @param {*} t
   */
  updateGameplay(dt, t) {
    super.update(dt, t);
  }

  /**
   * updates the gameplay state.
   * @function
   * @memberof GamePlay
   * @param {*} dt
   * @param {*} t
   */
  update(dt, t) {
    const { state, input, game } = this;
    state.update(dt, t);
    switch (state.get()) {
      case states.PLAYING:
        this.updateGameplay(dt, t);
        break;
      case states.PAUSED:
        if (state.first) {
          this.dialog = this.add(
            new DialogPause(
              game.width,
              game.height,
              () => {
                if (state.is([states.PAUSED]) && input.keys.key("KeyP")) {
                  input.keys.reset();
                  this.dialog.close();
                }
              },
              () => {
                state.set(states.PLAYING);
              }
            )
          );
        }
        this.dialog.update(dt, t);
        break;
    }

    if (!state.is([states.PAUSED]) && input.keys.key("KeyP")) {
      state.set(states.PAUSED);
      input.keys.reset();
    }
  }
}

export default GamePlay;
