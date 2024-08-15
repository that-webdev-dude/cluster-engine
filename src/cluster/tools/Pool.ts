import { Entity } from "../core/ECS";

type EntityType = { active: boolean; dead: boolean };

type CreatorFn<T extends Entity> = () => T;

export class Pool<T extends Entity> {
  private _cache: T[];

  constructor(private _creator: CreatorFn<T>, initialCacheLength: number = 10) {
    this._cache = Array.from({ length: initialCacheLength }, () => {
      const entity = this._creator();
      entity.active = true;
      entity.dead = false;
      return entity;
    });
  }

  next(): T {
    // Remove dead entities from the cache
    this._cache = this._cache.filter((e: EntityType) => !e.dead);

    // Find the first inactive entity
    let entity: T | undefined = this._cache.find(
      (e: EntityType) => !e.active && !e.dead
    );
    if (!entity) {
      entity = this._create();
    }
    entity.active = true;
    return entity;
  }

  private _create(): T {
    const entity = this._creator();
    entity.active = true;
    entity.dead = false;
    this._cache.push(entity);
    return entity;
  }

  removeDeadEntities(): void {
    this._cache = this._cache.filter((e: EntityType) => !e.dead);
  }
}
