import * as Cluster from "../../../cluster";
import * as Events from "../events";

type State = {
  count: number;
};

const state: State = {
  count: 0,
};

const mutations = {
  setCount(state: State, payload: { amount: number }) {
    state.count += payload.amount;
  },
  resetCount(state: State) {
    state.count = 0;
  },
};

const actions = {
  increment(context: Cluster.Store) {
    if (context.commit("setCount", { amount: 1 }))
      context.emit<Events.CountIncrementedEvent>(
        {
          type: "count-incremented",
          data: {
            count: context.get("count"),
          },
        },
        true
      );
  },
  decrement(context: Cluster.Store) {
    if (context.commit("setCount", { amount: -1 }))
      context.emit<Events.CountDecrementedEvent>(
        {
          type: "count-decremented",
          data: {
            count: context.get("count"),
          },
        },
        true
      );
  },
  reset(context: Cluster.Store) {
    if (context.commit("resetCount"))
      context.emit<Events.CountResetEvent>(
        {
          type: "count-reset",
          data: {
            count: context.get("count"),
          },
        },
        true
      );
  },
};

const getters = {
  count(state: State) {
    return state.count;
  },
};

export const store = new Cluster.Store({
  state,
  mutations,
  actions,
  getters,
});
