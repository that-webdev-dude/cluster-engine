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
}

const state = {
  screenWidth: 800,
  screenHeight: 600,
  gameScene: GameScenes.GameMenu,
};

const getters = {
  screenHeight: (state: any) => state.screenHeight,
  screenWidth: (state: any) => state.screenWidth,
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
