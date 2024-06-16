type Listener = (data?: any) => void;
type Events = {
  [key: string]: Listener[];
};

class Emitter {
  private events: Events;

  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to the event system.
   * @param {String} event
   * @param {Function} listener
   */
  on(event: string = "", listener: Listener = () => {}): number {
    if (!this.events.hasOwnProperty(event)) this.events[event] = [];
    return this.events[event].push(listener);
  }

  /**
   * Fires the handlers of a specific event.
   * @param {String} event
   * @param {Object} data
   */
  emit(event: string = "", data: any = {}): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => {
      listener(data);
    });
  }

  /**
   * Unsubscribe, by removing a specific
   * listener from an event.
   * @param {String} event
   * @param {Function} listener
   */
  removeListener(event: string = "", listener: Listener = () => {}): void {
    if (!this.events[event])
      throw new Error(`Can't remove listener. Event ${event} doesn't exist!`);
    this.events[event] = this.events[event].filter(
      (targetListener) => targetListener !== listener
    );
  }
}

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
  mutations?: {
    [key: string]: Mutation;
  };
};

export class Store extends Emitter {
  private mutations: {
    [key: string]: Mutation;
  };
  private actions: {
    [key: string]: Action;
  };
  private status: string;
  public state: State;

  constructor(options: StoreOptions = {}) {
    super();
    const { state = {}, actions = {}, mutations = {} } = options;
    this.mutations = mutations;
    this.actions = actions;
    this.status = "resting";
    this.state = state;

    const self = this;
    self.state = state;
    self.state = new Proxy(self.state, {
      set: function (state, key, value) {
        if (!state.hasOwnProperty(key))
          throw new Error(`The key "${String(key)}" is not declared`);
        if (self.status !== "mutation")
          throw new Error(
            `Use a mutation to set "${String(key)}" to "${value}"`
          );

        Reflect.set(state, key, value);
        self.emit(`${String(key)}-change`, self.state[String(key)]);
        self.status = "resting";
        return true;
      },
    });

    Object.freeze(this);
  }

  dispatch(actionKey: string, payload?: any): boolean {
    if (typeof this.actions[actionKey] !== "function")
      throw new Error(`Action ${actionKey} doesn't exist!`);
    this.status = "action";
    this.actions[actionKey](this, payload);
    return true;
  }

  commit(mutationKey: string, payload?: any): boolean {
    if (typeof this.mutations[mutationKey] !== "function")
      throw new Error(`Mutation ${mutationKey} doesn't exist!`);
    this.status = "mutation";
    this.mutations[mutationKey](this.state, payload);
    return true;
  }
}
