import Screen from "./Screen";
import cluster from "../cluster";
import DialogPause from "../dialogs/DialogPause";
import Vector from "../cluster/utils/Vector";

// prettier-ignore
const { 
  State,
  Rect,
  Circle,
  Physics,
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

    const playerRadius = 50;
    const player = new Circle({
      radius: playerRadius,
      style: { fill: "transparent", stroke: "white" },
    });
    player.radius = playerRadius;
    player.position = new Vector(10, 10);
    player.velocity = new Vector(0, 0);
    player.acceleration = new Vector(0, 0);
    player.maxVelocity = 500;

    this.state = new State(states.PLAYING);
    this.background = this.add(background);
    this.player = this.add(player);
    this.dialog = null;
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
    let { children } = this;
    children.forEach((child) => {
      if (
        child.acceleration &&
        child.velocity &&
        child.position &&
        child.velocity.magnitude < 10
      ) {
        child.velocity.set(0, 0);
      }
      // Physics.World.applyGravity(this.player, 500);
      Physics.World.applyFriction(this.player, 400);
    });

    let playerVelocity = this.player.velocity.magnitude;
    if (this.input.keys.x || this.input.keys.y) {
      if (playerVelocity < this.player.maxVelocity) {
        Physics.World.applyForce(this.player, {
          x: this.input.keys.x * 2000,
          y: this.input.keys.y * 2000,
        });
      }
    }
    Physics.World.reposition(this.player, dt);
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
