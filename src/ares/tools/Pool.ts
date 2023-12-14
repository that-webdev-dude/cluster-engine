interface Entity {
  dead: boolean;
  reset?: () => void;
}

type CreatorFn = () => Entity;

class Pool {
  private _creator: CreatorFn;
  private _cache: Entity[];

  constructor(
    creatorFn: CreatorFn = () => ({ dead: true }),
    initialCacheLength: number = 10
  ) {
    this._creator = creatorFn;
    this._cache = Array.from({ length: initialCacheLength }, () =>
      creatorFn()
    ).map((entity: Entity) => {
      entity.dead = true;
      return entity;
    });
  }

  private _create(): Entity {
    const entity = this._creator();
    entity.dead = false;
    this._cache.push(entity);
    return entity;
  }

  next(): Entity {
    let entity = this._cache.find((e: Entity) => e.dead);
    if (!entity) {
      entity = this._create();
    }
    if (entity.reset) {
      entity.reset();
    }
    entity.dead = false;
    return entity;
  }
}

export default Pool;
