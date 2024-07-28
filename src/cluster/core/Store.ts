import { Emitter } from "./Emitter";

type Mutation = (state: State, payload?: any) => void;
type Action = (store: Store, payload?: any) => void;
type State = {
  [key: string]: any;
};

type StoreOptions = {
  state?: State;
  actions?: {
    [key: string]: Action;
  };
  getters?: {
    [key: string]: any;
  };
  mutations?: {
    [key: string]: Mutation;
  };
};

export class Store extends Emitter {
  private static _instance: Store | undefined = undefined;
  private _status: string = "resting";
  private _state: State = {};
  private _mutations: {
    [key: string]: Mutation;
  } = {};
  private _actions: {
    [key: string]: Action;
  } = {};
  private _getters: {
    [key: string]: any;
  } = {};

  constructor(options: StoreOptions = {}) {
    super();
    if (Store._instance) {
      return Store._instance;
    } else {
      const {
        state = {},
        actions = {},
        getters = {},
        mutations = {},
      } = options;
      this._mutations = mutations;
      this._getters = getters;
      this._actions = actions;
      this._status = "resting";
      this._state = state;

      const self = this;
      self._state = state;
      self._state = new Proxy(self._state, {
        set: function (state, key, value) {
          if (!state.hasOwnProperty(key))
            throw new Error(`The key "${String(key)}" is not declared`);
          if (self._status !== "mutation")
            throw new Error(
              `Use a mutation to set "${String(key)}" to "${value}"`
            );

          Reflect.set(state, key, value);
          self.emit(`${String(key)}-changed`, self._state[String(key)]);
          self._status = "resting";
          return true;
        },
      });

      // Object.freeze(this);
      Object.seal(this);

      Store._instance = this;

      return this;
    }
  }

  dispatch(actionKey: string, payload?: any): boolean {
    if (typeof this._actions[actionKey] !== "function")
      throw new Error(`Action ${actionKey} doesn't exist!`);
    this._status = "action";
    this._actions[actionKey](this, payload);
    return true;
  }

  commit(mutationKey: string, payload?: any): boolean {
    if (typeof this._mutations[mutationKey] !== "function")
      throw new Error(`Mutation ${mutationKey} doesn't exist!`);
    this._status = "mutation";
    this._mutations[mutationKey](this._state, payload);
    return true;
  }

  get(key: string): any {
    if (typeof this._getters[key] !== "function")
      throw new Error(`Getter ${key} doesn't exist!`);
    return this._getters[key](this._state);
  }
}
