import { Store } from "../cluster";

export enum GameScenes {
  GameMenu = "GameMenu",
  GamePlay = "GamePlay",
}

export enum GameCollisionLayer {
  Default = 1 << 0,
  Player = 1 << 1,
  Enemy = 1 << 2,
  Bullet = 1 << 3,
  Wall = 1 << 4,
}

// store
const state = {
  screenHeight: 20 * 32,
  screenWidth: 26 * 32,
  worldHeight: 20 * 32,
  worldWidth: 26 * 32 * 2,
  gameScene: GameScenes.GamePlay,
};

const getters = {
  screenHeight: (state: any) => state.screenHeight,
  screenWidth: (state: any) => state.screenWidth,
  worldHeight: (state: any) => state.worldHeight,
  worldWidth: (state: any) => state.worldWidth,
  gameScene: (state: any) => state.gameScene,
};

const actions = {
  setGameScene(context: any, scene: GameScenes) {
    context.commit("setGameScene", scene);
  },

  dummy() {
    console.log("Dummy action");
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
