export class Container<T> {
  private _items: Map<number, T> = new Map();
  private _index = 0;

  get length() {
    return this.size;
  }

  get size() {
    return this._items.size;
  }

  at(index: number): T | undefined {
    return this.get(index);
  }

  get(index: number): T | undefined {
    return this._items.get(index);
  }

  add(...items: any[]): void {
    items.forEach((item) => {
      this._items.set(this._index++, item);
    });
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

  clear() {
    this._items.clear();
  }

  filter(fn: (item: T) => boolean): Container<T> {
    const result: Container<T> = new Container<T>();
    this._items.forEach((item) => {
      if (fn(item)) {
        result.add(item);
      }
    });
    return result;
  }

  forEach(fn: (item: T, id: number) => void) {
    this._items.forEach((item, id) => fn(item, id));
  }
}
