type Listener = (data?: any) => void;
type Events = {
  [key: string]: Listener[];
};

export class Emitter {
  private _events: Events;

  constructor() {
    this._events = {};
  }

  /** Subscribe to the event system.
   * @param {String} event
   * @param {Function} listener
   */
  on(event: string = "", listener: Listener = () => {}): number {
    if (!this._events.hasOwnProperty(event)) this._events[event] = [];
    return this._events[event].push(listener);
  }

  /** Fires the handlers of a specific event.
   * @param {String} event
   * @param {Object} data
   */
  emit(event: string = "", data: any = {}): void {
    if (!this._events[event]) return;
    this._events[event].forEach((listener) => {
      listener(data);
    });
  }

  /** Unsubscribe, by removing a specific
   * listener from an event.
   * @param {String} event
   * @param {Function} listener
   */
  removeListener(event: string = "", listener: Listener = () => {}): void {
    if (!this._events[event])
      throw new Error(`Can't remove listener. Event ${event} doesn't exist!`);
    this._events[event] = this._events[event].filter(
      (targetListener) => targetListener !== listener
    );
  }

  /** Unsubscribe, by removing all listeners
   * from a specific event.
   */
  removeAllListeners(): void {
    this._events = {};
  }
}
