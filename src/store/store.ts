import { name } from "../../project.config";
import { Store } from "../cluster";

type State = {
  [key: string]: any;
};

const state = {
  scores: 10,
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
};

const getters = {
  scores: (state: State) => {
    return state.scores;
  },
};

const mutations = {
  setScores: (state: State, payload: any) => {
    state.scores += payload;
  },
};

export const store = new Store({ state, getters, mutations, actions });
