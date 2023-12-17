import { EntityType } from "../types";

type CreatorFn<T extends EntityType> = () => T;

class Pool<T extends EntityType> {
  private _creator: CreatorFn<T>;
  private _cache: T[];

  constructor(creatorFn?: CreatorFn<T>, initialCacheLength: number = 10) {
    if (!creatorFn) {
      throw new Error("No default creator function provided");
    }
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

  next(reset?: (entity: T) => void): T {
    const deadEntities = this._cache.filter((e: EntityType) => e.dead);
    let entity: T | undefined = deadEntities.pop();
    if (!entity) {
      entity = this._create();
    }
    if (reset) {
      reset(entity);
    }
    entity.dead = false;
    return entity;
  }
}

export default Pool;
