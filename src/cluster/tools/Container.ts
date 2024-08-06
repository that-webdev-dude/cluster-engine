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

  add(...items: T[]): void {
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

  delete(...items: T[]) {
    this.remove(...items);
  }

  clear() {
    this._items.clear();
  }

  has(item: T): boolean {
    return Array.from(this._items.values()).includes(item);
  }

  find(fn: (item: T) => boolean): T | undefined {
    let result: T | undefined;
    this._items.forEach((item) => {
      if (fn(item)) {
        result = item;
      }
    });
    return result;
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

  toArray(): T[] {
    return Array.from(this._items.values());
  }
}
