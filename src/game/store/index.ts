import { Store } from "../../cluster";

// store
const state = {
  screenHeight: 640,
  screenWidth: 832,
  scores: 0,
  lives: 3,
  level: 1,
};

const getters = {
  screenHeight: (state: any) => state.screenHeight,
  screenWidth: (state: any) => state.screenWidth,
  scores: (state: any) => state.scores,
  lives: (state: any) => state.lives,
};

const actions = {
  addScores(context: Store, score: number) {
    context.commit("setScores", state.scores + score);
  },
  resetScores(context: Store) {
    context.commit("setScores", 0);
  },
  addLife(context: Store) {
    context.commit("setLives", state.lives + 1);
  },
  removeLife(context: Store) {
    context.commit("setLives", state.lives - 1);
  },
  resetGame(context: Store) {
    context.commit("setScores", 0);
    context.commit("setLives", 3);
    context.commit("setLevel", 1);
  },
};

const mutations = {
  setScreenHeight(state: any, height: number) {
    state.screenHeight = height;
  },
  setScreenWidth(state: any, width: number) {
    state.screenWidth = width;
  },
  setScores(state: any, scores: number) {
    state.scores = scores;
  },
  setLives(state: any, lives: number) {
    state.lives = lives;
  },
  setLevel(state: any, level: number) {
    state.level = level;
  },
};

/** Game store
 * @getters screenHeight, screenWidth
 * @actions
 * @mutations
 */
const store = new Store({
  state,
  getters,
  actions,
  mutations,
});

export { store };
