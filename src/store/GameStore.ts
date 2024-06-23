import { Scene, Store } from "../cluster";

const SCENES = {
  DEFAULT: "gameScene1",
  TITLE: "gameScene1",
  PLAY: "gameScene2",
};

const state = {
  scene: SCENES.DEFAULT,
  title: "Shooter Game",
  width: 640,
  height: 320,
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
};

const actions = {
  setScene: (context: Store, scene: string) => {
    if (scene === SCENES.TITLE || scene === SCENES.PLAY) {
      context.commit("setScene", scene);
    } else {
      throw new Error("Invalid scene name.");
    }
  },
};

const mutations = {
  setScene: (state: any, payload: any) => {
    state.scene = payload;
  },
};

export const store = new Store({
  state,
  getters,
  actions,
  mutations,
});
