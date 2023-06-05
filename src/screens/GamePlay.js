import Screen from "./Screen";
import cluster from "../cluster";
import TiledLevel from "../levels/TiledLevel";
const { State, Assets } = cluster;

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

    // // LEVEL LOADING
    // // FROM URL ONLY FOR NOW
    // // to do is the serialization
    loadTiledLevel(globals.level)
      .then((levelData) => {
        const level = new TiledLevel(levelData);

        this.level = this.add(level);
      })
      .then(() => {
        // this.loaded = true;
      });
  }

  update(dt, t) {
    super.update(dt, t);
    const { state } = this;
    switch (state.get()) {
      case states.LOADING:
        console.log("LOADING");
        if (this.loaded) {
          state.set(states.READY);
        }
        break;

      case states.READY:
        console.log("READY");
        break;

      case states.PLAYING:
        console.log("PLAYING");
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
  }
}

export default GamePlay;
