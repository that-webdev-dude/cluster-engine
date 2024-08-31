// import { SystemEvents } from "../../cluster";
// import { Emitter, QueuedEmitter, HybridEmitter } from "../../cluster";
// import { EventEmitter } from "events";

type EntityId = number;

class ComponentIndex {
  private index: Map<string, Set<EntityId>>;
  private cache: Map<string, Set<EntityId>>;
  private entities: Map<EntityId, Entity>;

  constructor() {
    this.index = new Map();
    this.cache = new Map();
    this.entities = new Map();
  }

  addEntity(entity: Entity) {
    this.entities.set(entity.id, entity);
    for (let componentName of entity.components.keys()) {
      if (!this.index.has(componentName)) {
        this.index.set(componentName, new Set());
      }
      this.index.get(componentName)!.add(entity.id);
    }
    this.cache.clear(); // Clear cache on modification
  }

  removeEntity(entity: Entity) {
    this.entities.delete(entity.id);
    for (let componentName of entity.components.keys()) {
      this.index.get(componentName)?.delete(entity.id);
    }
    this.cache.clear(); // Clear cache on modification
  }

  getEntitiesWithComponents(componentNames: string[]): Set<Entity> {
    const cacheKey = componentNames.sort().join(",");
    if (this.cache.has(cacheKey)) {
      return this.getEntityInstances(this.cache.get(cacheKey)!);
    }

    let result: Set<EntityId> | null = null;
    for (let componentName of componentNames) {
      if (this.index.has(componentName)) {
        const componentSet = this.index.get(componentName);
        if (componentSet) {
          if (result === null) {
            result = new Set(componentSet);
          } else {
            result = new Set(
              [...result].filter((x: EntityId) => componentSet.has(x))
            );
          }
        }
      } else {
        result = new Set();
        break;
      }
    }

    this.cache.set(cacheKey, result!);

    return this.getEntityInstances(result!);
  }

  private getEntityInstances(ids: Set<EntityId>): Set<Entity> {
    return new Set([...ids].map((id) => this.entities.get(id)!));
  }

  get cacheSize() {
    return this.cache.size;
  }
}

export class Entity {
  private static nextId: EntityId = 0;

  id: EntityId;
  dead: boolean;
  active: boolean;
  components: Map<string, Component>;

  constructor() {
    this.id = Entity.nextId++;
    this.dead = false;
    this.active = true;
    this.components = new Map();
  }

  get type() {
    return this.constructor.name;
  }

  get<T extends Component>(name: string): T | undefined {
    return this.components.get(name) as T | undefined;
  }

  add(component: Component) {
    if (!component) return;
    this.components.set(component.name, component);
  }

  remove(name: string) {
    this.components.delete(name);
  }
}

export class Component {
  name: string;

  constructor(name: string) {
    if (!name) {
      throw new Error("[Component Error] Component name is required");
    }
    this.name = name;
  }
}

export class System {
  componentsRequired: string[];

  constructor(componentsRequired: string[]) {
    this.componentsRequired = componentsRequired;
  }

  update(entities: Set<Entity>, dt?: number, t?: number) {
    // ...To be implemented by specific systems
  }
}

export class Scene {
  private componentIndex: ComponentIndex;
  private entities: Map<EntityId, Entity>;
  private systems: System[];

  constructor() {
    this.componentIndex = new ComponentIndex();
    this.entities = new Map();
    this.systems = [];
  }

  addEntity(entity: Entity) {
    this.entities.set(entity.id, entity);
    this.componentIndex.addEntity(entity);
  }

  removeEntity(entity: Entity) {
    if (this.entities.delete(entity.id)) {
      this.componentIndex.removeEntity(entity);
    }
  }

  entityNames() {
    return Array.from(this.entities.values()).map((entity) => entity.type);
  }

  cacheSize() {
    return this.componentIndex.cacheSize;
  }

  cache() {
    return this.componentIndex;
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  update(dt: number, t: number) {
    for (let system of this.systems) {
      const entities = this.componentIndex.getEntitiesWithComponents(
        system.componentsRequired
      );
      if (!entities.size) continue;
      system.update(entities, dt, t);
    }
  }
}
