export class Container<T> {
  private _items: Map<number, T> = new Map();
  private _next = 0;

  get length() {
    return this.size;
  }

  get size() {
    return this._items.size;
  }

  get(index: number): T | undefined {
    return this._items.get(index);
  }

  add(...items: any[]): void {
    items.forEach((item) => {
      this._items.set(this._next++, item);
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
