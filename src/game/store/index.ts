import { Store } from "../../cluster";

// store
const state = {
  screenHeight: 640,
  screenWidth: 832,
  scores: 20,
};

const getters = {
  screenHeight: (state: any) => state.screenHeight,
  screenWidth: (state: any) => state.screenWidth,
  scores: (state: any) => state.scores,
};

const actions = {
  addScore(context: Store, score: number) {
    context.commit("setScores", state.scores + score);
  },
  resetScore(context: Store) {
    context.commit("setScores", 0);
  },
  logScores(context: Store) {
    context.commit("logScores");
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
  logScores(state: any) {
    console.log(state.scores);
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
