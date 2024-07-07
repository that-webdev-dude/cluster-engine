import { Store } from "../cluster";

const state = {
  screenWidth: 800,
  screenHeight: 600,
};

const getters = {
  screenWidth: (state: any) => state.screenWidth,
  screenHeight: (state: any) => state.screenHeight,
};

const actions = {};

const mutations = {};

const store = new Store({
  state,
  getters,
  actions,
  mutations,
});

export { store };
