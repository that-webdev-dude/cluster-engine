export class Container<T> {
  private _items: Map<number, T> = new Map();
  private _index = 0;

  get length() {
    return this.size;
  }

  get size() {
    return this._items.size;
  }

  get(index: number): T | undefined {
    return this._items.get(index);
  }

  at(index: number): T | undefined {
    return this.get(index);
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

  // delete(item: T) {
  //   this.remove(item);
  // }

  clear() {
    this._items.clear();
  }

  filter(predicate: (item: T) => boolean): Container<T> {
    const result: Container<T> = new Container<T>();
    this._items.forEach((item) => {
      if (predicate(item)) {
        result.add(item);
      }
    });
    return result;
  }

  forEach(callback: (item: T, id: number) => void) {
    this._items.forEach((item, id) => callback(item, id));
  }
}
