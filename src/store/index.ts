import { Store } from "../cluster";

enum GameScenes {
  GameMenu = "GameMenu",
  GamePlay = "GamePlay",
}

const state = {
  screenWidth: 800,
  screenHeight: 600,
  gameScenes: GameScenes,
  gameScene: GameScenes.GameMenu,
};

const getters = {
  screenHeight: (state: any) => state.screenHeight,
  screenWidth: (state: any) => state.screenWidth,
  gameScenes: (state: any) => state.gameScenes,
  gameScene: (state: any) => state.gameScene,
};

const actions = {
  setGameScene(context: any, scene: GameScenes) {
    context.commit("setGameScene", scene);
  },
};

const mutations = {
  setGameScene(state: any, payload: GameScenes) {
    state.gameScene = payload;
  },
};

const store = new Store({
  state,
  getters,
  actions,
  mutations,
});

export { store };
