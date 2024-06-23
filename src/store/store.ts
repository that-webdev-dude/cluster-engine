import { Store } from "../cluster";

type State = {
  [key: string]: any;
};

const SCENES = {
  TITLE: "gameScene1",
  PLAY: "gameScene2",
};

const state = {
  scene: "gameScene1",
  title: "Shooter Game",
  scores: 0,
  height: 320,
  width: 640,
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
  setScene: (context: Store, scene: string) => {
    if (scene === SCENES.TITLE || scene === SCENES.PLAY) {
      context.commit("setScene", scene);
    } else {
      throw new Error("Invalid scene name.");
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
  height: (state: State) => {
    return state.height;
  },
  width: (state: State) => {
    return state.width;
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
