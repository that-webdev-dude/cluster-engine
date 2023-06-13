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
  Camera,
  Assets, 
  Container,
  // utils
  Vector,
  entity
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
    const gameW = game.width;
    const gameH = game.height;

    super(game, input, globals, transitions);
    this.state = new State(states.LOADING);
    this.camera = null;
    this.level = null;
    this.player = null;
    this.dialog = null;
    this.scoreText = null;
    this.livesText = null;
    this.timerText = null;
    this.zombies = new Container();
    this.barrels = new Container();
    this.globals = globals;
    this.timer = globals.timer;
    this.lives = globals.lives;
    this.scores = globals.scores;
    this.transitions = transitions;
    this.firstUpdate = true;
    this.elapsed = 0;
    this.loaded = false;
    this.loadingDialog = this.makeLoadingDialog();
    console.log(
      "file: GamePlay.js:69 ~ GamePlay ~ constructor ~ this.loadingDialog:",
      this.loadingDialog
    );

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

        // now add the level UI
        const { scores, timer } = this.globals;
        const { view } = game;
        this.scoreText = new Text(`scores: ${scores}`, {
          fill: "white",
          font: '16px "Press Start 2P"',
        });
        this.scoreText.position.set(view.width / 2 + 100, view.height - 40);

        this.livesText = new Text(`lives: ${globals.lives}`, {
          fill: "white",
          font: '16px "Press Start 2P"',
        });
        this.livesText.position.set(view.width / 2 - 100, view.height - 40);

        this.timerText = new Text(`${timer}`, {
          fill: "red",
          font: '32px "Press Start 2P"',
        });
        this.timerText.position.set(view.width / 2, 32);

        // finally the camera
        this.camera = this.add(new Camera(this.player, view, view));
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
      this.camera.remove(this.loadingDialog);
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
      this.camera.remove(this.dialog);
      this.camera.add(this.level);
      this.camera.add(this.player);
      this.camera.add(this.zombies);
      this.camera.add(this.barrels);
      this.camera.add(this.scoreText);
      this.camera.add(this.livesText);
      this.camera.add(this.timerText);
      state.set(states.PLAYING);
    });
  }

  /**
   * playerDies
   */
  playerDies() {
    const { globals, player, livesText } = this;
    const { x, y } = globals.spawns.find((spawn) => spawn.name === "player");
    player.respawn({ x, y }, () => {
      globals.lives--;
      livesText.text = `lives: ${globals.lives}`;
    });
  }

  /**
   * zombieDies
   */
  zombieDies(zombie) {
    const { scoreText } = this;
    zombie.dead = true;
    this.scores++;
    scoreText.text = `scores: ${this.scores}`;
  }

  /**
   * updateGameplay
   * @param {number} dt time step ms
   * @param {number} t elapsed seconds
   */
  updateGameplay(dt, t) {
    super.update(dt, t);
    // prettier-ignore
    const { 
      globals, 
      camera, 
      player, 
      barrels,
      zombies,
      timerText,
      transitions,
    } = this;

    // timer update
    this.timer -= dt;
    timerText.text = Math.floor(this.timer);

    // if out of time
    if (this.timer <= 0) {
      this.timer = globals.timer;
      camera.flash();
      this.playerDies();
    }

    // if player hits barrel
    barrels.children.forEach((barrel) => {
      entity.hit(player, barrel, () => {
        this.timer = globals.timer;
        camera.flash();
        camera.shake();
        this.playerDies();
      });
    });

    // if player hits zombie
    zombies.children.forEach((zombie) => {
      entity.hit(player, zombie, () => {
        this.zombieDies(zombie);
      });
    });

    if (zombies.children.length === 0) {
      globals.levelId++;
      if (globals.levelId > globals.noLevels) {
        transitions.onWin();
      } else {
        transitions.onNext(globals.levelId, globals.spawns);
      }
    }

    if (global.lives === 0) {
      transitions.onLoose();
    }
  }

  update(dt, t) {
    const { state } = this;
    state.update(dt, t);

    switch (state.get()) {
      // loading state
      case states.LOADING:
        if (this.state.first) {
          this.camera.add(this.loadingDialog);
        }
        this.loadingDialog.update(dt, t, {
          shouldClose: this.loaded,
        });

        break;

      // ready state
      case states.READY:
        if (this.state.first) {
          this.dialog = this.camera.add(this.makeReadyDialog());
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

    // state.update(dt, t);
  }
}

export default GamePlay;
