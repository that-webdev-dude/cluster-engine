import { Store } from "../../cluster";

// store
const state = {
  screenHeight: 640,
  screenWidth: 832,
};

const getters = {
  screenHeight: (state: any) => state.screenHeight,
  screenWidth: (state: any) => state.screenWidth,
};

const actions = {};

const mutations = {};

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
