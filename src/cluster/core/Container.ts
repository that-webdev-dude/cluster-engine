export class Container<T> {
  private _items: Map<number, T> = new Map();
  private _next = 0;

  get size() {
    return this._items.size;
  }

  get(index: number): T | undefined {
    return this._items.get(index);
  }

  add(...items: any[]): void {
    if (Array.isArray(items[0])) {
      // If the first argument is an array, treat it as an array of T
      (items[0] as T[]).forEach((item) => {
        this._items.set(this._next++, item);
      });
    } else {
      // Otherwise, treat it as a list of T
      items.forEach((item) => {
        this._items.set(this._next++, item);
      });
    }
  }

  remove(...items: T[]) {
    items.forEach((item) => {
      this._items.forEach((value, key) => {
        if (value === item) {
          this._items.delete(key);
        }
      });
    });
  }

  delete(item: T) {
    this.remove(item);
  }

  clear() {
    this._items.clear();
  }

  forEach(callback: (item: T, id: number) => void) {
    this._items.forEach((item, id) => callback(item, id));
  }
}
