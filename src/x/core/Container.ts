import { Entity } from "./Entity";

export class Container {
  private _cache = { lookupEntities: new Map<string, Entity>() };
  private _entities: Map<string, Entity> = new Map();

  addEntity(entity: Entity) {
    this._entities.set(entity.id, entity);
  }

  removeEntity(entity: Entity) {
    this._entities.delete(entity.id);
  }

  forEach(callback: (entity: Entity, entityId: string) => void) {
    this._entities.forEach(callback);
  }

  getEntityById(entityId: string) {
    return this._entities.get(entityId);
  }

  getEntitiesByComponent(component: string) {
    const entities = this._cache.lookupEntities;
    entities.clear();
    this._entities.forEach((entity) => {
      if (entity.has(component)) {
        entities.set(entity.id, entity);
      }
    });
    return entities;
  }

  getEntitiesByComponents(components: string[]) {
    const entities = this._cache.lookupEntities;
    entities.clear();
    this._entities.forEach((entity) => {
      if (entity.hasAll(components)) {
        entities.set(entity.id, entity);
      }
    });
    return entities;
  }
}
