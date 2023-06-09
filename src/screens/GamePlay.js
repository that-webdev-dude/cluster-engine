import Screen from "./Screen";
import Player from "../entities/Player";
import Zombie from "../entities/Zombie";
import Barrel from "../entities/Barrel";
import TiledLevel from "../levels/TiledLevel";
import LoadingDialog from "../dialogs/LoadingDialog";
import ReadyDialog from "../dialogs/ReadyDialog";
import cluster from "../cluster";
// prettier-ignore
const { 
  Text,
  State, 
  Assets, 
  Vector,
  Container 
} = cluster;

/**
 * loadTiledLevel
 * @param {String} levelID id of the level
 * @returns level raw data
 */
const loadTiledLevel = async (levelID) => {
  try {
    const levelURL = await import(`../levels/level${levelID}.json`);
    const levelData = await Assets.json(levelURL.default);
    return levelData;
  } catch (error) {
    console.log(error);
  }
};

const states = {
  LOADING: 0,
  READY: 1,
  PLAYING: 2,
  PAUSED: 3,
  GAMEOVER: 4,
};

class GamePlay extends Screen {
  constructor(game, input, globals, transitions) {
    super(game, input, globals, transitions);
    this.state = new State(states.LOADING);
    this.loaded = false;
    this.level = null;
    this.player = null;
    this.dialog = null;
    this.zombies = new Container();
    this.barrels = new Container();
    this.firstUpdate = true;
    this.scoreText = null;
    this.livesText = null;
    this.timerText = null;
    this.elapsed = 0;
    this.timer = globals.timer;

    // // LEVEL LOADING
    // // FROM URL ONLY FOR NOW
    // // to do is the serialization
    const { levelId } = globals;
    loadTiledLevel(levelId)
      .then((levelData) => {
        // setup level
        this.level = new TiledLevel(levelData);
        this.level.spawns.forEach((spawn) => {
          const { name, x, y } = spawn;
          switch (name) {
            case `player`:
              this.player = new Player(input, new Vector(x, y));
              break;

            case `zombie1`:
              this.zombies.add(new Zombie(1, new Vector(x, y)));
              break;

            case `zombie2`:
              this.zombies.add(new Zombie(2, new Vector(x, y)));
              break;

            case `barrel`:
              this.barrels.add(new Barrel(new Vector(x, y)));
              break;

            default:
              break;
          }
        });

        // add now all the entities
        this.add(this.level);
        this.add(this.player);
        this.add(this.zombies);
        this.add(this.barrels);

        // now add the level UI
        const { scores, timer } = globals;
        this.scoreText = new Text(`scores: ${scores}`, {
          fill: "white",
          font: '16px "Press Start 2P"',
        });
        this.scoreText.position.set(game.view.width / 2, game.view.height - 40);

        this.timerText = new Text(`${this.timer}`, {
          fill: "red",
          font: '32px "Press Start 2P"',
        });
        this.timerText.position.set(game.view.width / 2, 32);

        this.add(this.scoreText);
        this.add(this.timerText);
      })
      .then(() => {
        this.globals.spawns = this.level.spawns;
        this.loaded = true;
      });
  }

  /**
   * makeLoadingDialog
   * @returns LoadingDialog
   */
  makeLoadingDialog() {
    const { game, state } = this;
    const { width, height } = game.view;
    return new LoadingDialog(width, height, () => {
      this.remove(this.dialog);
      state.set(states.READY);
    });
  }

  /**
   * makeReadyDialog
   * @returns ReadyDialog
   */
  makeReadyDialog() {
    const { game, state } = this;
    const { width, height } = game.view;
    return new ReadyDialog(width, height, () => {
      this.remove(this.dialog);
      state.set(states.PLAYING);
    });
  }

  /**
   * updateGameplay
   * @param {number} dt time step ms
   * @param {number} t elapsed seconds
   */
  updateGameplay(dt, t) {
    super.update(dt, t);

    // timer update
    this.timer -= dt;
    this.timerText.text = Math.floor(this.timer);
  }

  update(dt, t) {
    const { state } = this;

    switch (state.get()) {
      // loading state
      case states.LOADING:
        if (this.state.first) {
          this.dialog = this.add(this.makeLoadingDialog());
        }
        this.dialog.update(dt, t, {
          shouldClose: this.loaded,
        });

        break;

      // ready state
      case states.READY:
        if (this.state.first) {
          this.dialog = this.add(this.makeReadyDialog());
        }
        this.dialog.update(dt, t);

        break;

      case states.PLAYING:
        this.updateGameplay(dt, t);
        break;

      case states.PAUSED:
        console.log("PAUSED");
        break;

      case states.GAMEOVER:
        console.log("GAMEOVER");
        break;

      default:
        break;
    }

    state.update(dt, t);
  }
}

export default GamePlay;
