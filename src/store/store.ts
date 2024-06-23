import { Scene, Store } from "../cluster";

const SCENES = {
  DEFAULT: "gameTitle",
  TITLE: "gameTitle",
  PLAY: "gamePlay",
};

const state = {
  scene: SCENES.DEFAULT,
  title: "Shooter Game",
  width: 640,
  height: 320,
  scores: 0,
};

const getters = {
  scene: (state: any) => {
    return state.scene;
  },
  title: (state: any) => {
    return state.title;
  },
  height: (state: any) => {
    return state.height;
  },
  width: (state: any) => {
    return state.width;
  },
  scores: (state: any) => {
    return state.scores;
  },
};

const actions = {
  increaseScores: (context: Store, scores: number) => {
    context.commit("increaseScores", scores);
  },
  setScores: (context: Store, scores: number) => {
    context.commit("setScores", scores);
  },
  setScene: (context: Store, scene: string) => {
    if (scene === SCENES.TITLE || scene === SCENES.PLAY) {
      context.commit("setScene", scene);
    } else {
      throw new Error("Invalid scene name.");
    }
  },
};

const mutations = {
  increaseScores: (state: any, payload: number) => {
    state.scores += payload;
  },
  setScores: (state: any, payload: number) => {
    state.scores = payload;
  },
  setScene: (state: any, payload: string) => {
    state.scene = payload;
  },
};

const store = new Store({
  state,
  getters,
  actions,
  mutations,
});

export { store };
