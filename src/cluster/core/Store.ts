import { EventEmitter, Event } from "./Emitter";

const STATUS = {
  mutation: "mutation",
  resting: "resting",
  action: "action",
} as const;

type Getter = (state: State) => any;

type Mutation = (state: State, payload?: any) => void;

type Action = (store: Store, payload?: any) => void;

type State = any;

type StoreOptions = {
  state?: State;
  actions?: {
    [key: string]: Action;
  };
  getters?: {
    [key: string]: (state: State) => any;
  };
  mutations?: {
    [key: string]: Mutation;
  };
};

/**
 * The Store class is a centralized state management system.
 * It extends the EventEmitter to provide event-driven state changes.
 */
export class Store extends EventEmitter {
  private _status: string = STATUS.resting;
  private _state: State;
  private _getters: Map<string, Getter>;
  private _actions: Map<string, Action>;
  private _mutations: Map<string, Mutation>;

  /**
   * Creates an instance of Store.
   * @param options - The options to initialize the store.
   */
  constructor(options: StoreOptions) {
    super();

    const { state = {}, actions = {}, getters = {}, mutations = {} } = options;

    this._state = new Proxy(state, {
      set: (state, key, value) => {
        if (!(key in state)) {
          throw new Error(`The key "${String(key)}" is not declared`);
        }
        if (this._status !== STATUS.mutation) {
          throw new Error(
            `Use a mutation to set "${String(key)}" to "${value}"`
          );
        }

        Reflect.set(state, key, value);

        this._status = STATUS.resting;
        return true;
      },
    });

    this._mutations = new Map(Object.entries(mutations));
    this._actions = new Map(Object.entries(actions));
    this._getters = new Map(Object.entries(getters));

    Object.seal(this);
  }

  /**
   * Dispatches an action.
   * @param actionKey - The key of the action to dispatch.
   * @param payload - The payload to pass to the action.
   * @returns True if the action was dispatched successfully.
   */
  dispatch(actionKey: string, payload?: any): boolean {
    const action = this._actions.get(actionKey);
    if (!action) {
      throw new Error(`Action ${actionKey} doesn't exist!`);
    }
    this._status = STATUS.action;
    action(this, payload);
    return true;
  }

  /**
   * Commits a mutation.
   * @param mutationKey - The key of the mutation to commit.
   * @param payload - The payload to pass to the mutation.
   * @returns True if the mutation was committed successfully.
   */
  commit(mutationKey: string, payload?: any): boolean {
    const mutation = this._mutations.get(mutationKey);
    if (!mutation) {
      throw new Error(`Mutation ${mutationKey} doesn't exist!`);
    }
    this._status = STATUS.mutation;
    mutation(this._state, payload);
    return true;
  }

  /**
   * Gets the value of a getter.
   * @param key - The key of the getter to retrieve.
   * @returns The value returned by the getter.
   */
  get(getterKey: string): any {
    const getter = this._getters.get(getterKey);
    if (!getter) {
      throw new Error(`Getter ${getterKey} doesn't exist!`);
    }
    return getter(this._state);
  }
}

export type StoreEvent = Event;

export type StoreAction = Action;
