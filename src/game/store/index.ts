import { Store } from "../../cluster";

// store
const state = {
  screenHeight: 32 * 20,
  screenWidth: 32 * 12,
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
