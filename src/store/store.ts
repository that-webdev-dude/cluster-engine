import { Store } from "../cluster";

type State = {
  [key: string]: any;
};

export enum GameScene {
  TITLE = "gameTitle",
  PLAY = "gamePlay",
}

const state = {
  scene: GameScene.TITLE,
  title: "Shooter Game",
  scores: 0,
};

const actions = {
  increaseScores: (context: Store, amount: number) => {
    if (amount < 0) throw new Error("Amount must be a positive number.");
    context.commit("setScores", amount);
  },
  decreaseScores: (context: Store, amount: number) => {
    if (amount < 0) throw new Error("Amount must be a positive number.");
    context.commit("setScores", amount);
  },
  setScene: (context: Store, scene: GameScene) => {
    switch (scene) {
      case GameScene.TITLE:
        context.commit("setScene", GameScene.TITLE);
        break;
      case GameScene.PLAY:
        context.commit("setScene", GameScene.PLAY);
        break;
      default:
        throw new Error("Invalid scene");
    }
  },
  reset: (context: Store) => {
    context.commit("reset");
  },
};

const getters = {
  scene: (state: State) => {
    return state.scene;
  },
  title: (state: State) => {
    return state.title;
  },
  scores: (state: State) => {
    return state.scores;
  },
};

const mutations = {
  setScores: (state: State, payload: any) => {
    state.scores += payload;
  },
  setScene: (state: State, payload: any) => {
    state.scene = payload;
  },
  reset: (state: State) => {
    state.scores = 0;
  },
};

export const store = new Store({
  state,
  getters,
  mutations,
  actions,
});
