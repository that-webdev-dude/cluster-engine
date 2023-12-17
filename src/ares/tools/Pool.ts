import { Entity } from "../core/Entity";

type CreatorFn<T extends Entity> = () => T;

class Pool<T extends Entity> {
  private _creator: CreatorFn<T>;
  private _cache: T[];

  constructor(
    creatorFn: CreatorFn<T> = () => new Entity() as T,
    initialCacheLength: number = 10
  ) {
    this._creator = creatorFn;
    this._cache = Array.from({ length: initialCacheLength }, () =>
      creatorFn()
    ).map((entity: T) => {
      entity.dead = true;
      return entity;
    });
  }

  get cacheLength(): number {
    return this._cache.length;
  }

  private _create(): T {
    const entity = this._creator();
    entity.dead = false;
    this._cache.push(entity);
    return entity;
  }

  next(reset: (entity: T) => void = () => {}): T {
    let entity = this._cache.find((e: Entity) => e.dead) as T;
    if (!entity) {
      entity = this._create();
    }
    reset(entity);
    entity.dead = false;
    return entity;
  }
}

export default Pool;
