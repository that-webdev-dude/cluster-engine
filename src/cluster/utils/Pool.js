class Pool {
  constructor(creatorFn = () => {}, initialCacheLength = 10) {
    this.creator = creatorFn;
    this.cache = [...Array(initialCacheLength)]
      .map(() => creatorFn())
      .map((entity) => {
        entity.dead = true;
        return entity;
      });
  }

  create() {
    const { cache, creator } = this;
    const entity = creator();
    entity.dead = false;
    cache.push(entity);
    return entity;
  }

  next() {
    const { cache, creator } = this;
    let entity = cache.find((e) => e.dead);
    if (!entity) {
      entity = this.create();
    }
    if (entity.reset) {
      entity.reset();
    }
    entity.dead = false;
    return entity;
  }
}

export default Pool;
