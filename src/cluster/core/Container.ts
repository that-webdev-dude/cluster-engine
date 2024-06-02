import { Entity } from "./Entity";

export class Container<T> {
  private _cache = { lookupEntities: new Map<number, T>() };
  private _items: Map<number, T> = new Map();
  private _next = 0;

  get size() {
    return this._items.size;
  }

  add(item: T) {
    this._items.set(this._next++, item);
  }

  remove(item: T) {
    this._items.forEach((value, key) => {
      if (value === item) {
        this._items.delete(key);
      }
    });
  }

  delete(item: T) {
    this._items.forEach((value, key) => {
      if (value === item) {
        this._items.delete(key);
      }
    });
  }

  forEach(callback: (item: T) => void) {
    this._items.forEach((item) => callback(item));
  }
}
