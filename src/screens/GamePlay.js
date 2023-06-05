import Screen from "./Screen";
import cluster from "../cluster";
import TiledLevel from "../levels/TiledLevel";
import Player from "../entities/Player";
import Zombie from "../entities/Zombie";
import Barrel from "../entities/Barrel";
import Vector from "../cluster/utils/Vector";
// prettier-ignore
const { 
  State, 
  Assets, 
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
    this.zombies = new Container();
    this.barrels = new Container();

    // this.add(this.zombies);

    // // LEVEL LOADING
    // // FROM URL ONLY FOR NOW
    // // to do is the serialization
    loadTiledLevel(globals.level)
      .then((levelData) => {
        // setup level
        this.level = this.add(new TiledLevel(levelData));
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
        this.add(this.player);
        this.add(this.zombies);
        this.add(this.barrels);
      })
      .then(() => {
        this.globals.spawns = this.level.spawns;
        this.loaded = true;
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
