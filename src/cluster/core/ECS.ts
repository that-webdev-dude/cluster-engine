import { SystemEvents } from "../../cluster";
import { EntityId } from "../../cluster";
import { EventEmitter } from "events";

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

export class EventQueue {
  private _queue: Map<string, Function[]>;
  constructor() {
    this._queue = new Map();
  }

  addEventListener(event: string, callback: Function) {
    if (!this._queue.has(event)) {
      this._queue.set(event, []);
    }
    this._queue.get(event)!.push(callback);
  }

  processEventListeners() {
    if (!this._queue.size) return;

    for (let [event, callbacks] of this._queue) {
      // console.log(`[EventQueue] Processing event ${event}`);
      for (let callback of callbacks) {
        callback();
      }
    }

    this._queue.clear();
  }

  get size() {
    return this._queue.size;
  }
}

// add utilities to add and remove components from entities
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
  private static _emitter = new EventEmitter();

  static events = new EventQueue();

  static on(event: string, listener: (...args: any[]) => void) {
    System.events.addEventListener(event, listener);
  }

  static emit(event: string, ...args: any[]) {
    System._emitter.emit(event, ...args);
  }

  readonly componentsRequired: string[];

  constructor(componentsRequired: string[]) {
    this.componentsRequired = componentsRequired;
  }

  update(entities: Set<Entity>, dt?: number, t?: number) {
    // To be implemented by specific systems
  }
}

export class Scene {
  private componentIndex: ComponentIndex;
  private eventQueue: EventQueue;
  private entities: Map<EntityId, Entity>;
  private systems: System[];

  constructor() {
    this.componentIndex = new ComponentIndex();
    this.eventQueue = new EventQueue();
    this.entities = new Map();
    this.systems = [];
  }

  get events() {
    return this.eventQueue;
  }

  addEntity(entity: Entity) {
    if (!entity || this.entities.has(entity.id)) return;
    this.entities.set(entity.id, entity);
    this.componentIndex.addEntity(entity);
  }

  removeEntity(entity: Entity) {
    if (!entity || !this.entities.has(entity.id)) return;
    if (this.entities.delete(entity.id)) {
      this.componentIndex.removeEntity(entity);
    }
  }

  addSystem(system: System) {
    // system.on(SystemEvents.COMPONENT_ATTACHED, (entityId: EntityId) => {
    //   this.eventQueue.addEventListener(SystemEvents.COMPONENT_ATTACHED, () => {
    //     this.componentIndex.addEntity(this.entities.get(entityId)!);
    //   });
    // });

    // system.on(SystemEvents.COMPONENT_DETACHED, (entityId: EntityId) => {
    //   this.eventQueue.addEventListener(SystemEvents.COMPONENT_DETACHED, () => {
    //     this.componentIndex.removeEntity(this.entities.get(entityId)!);
    //   });
    // });

    // system.on(SystemEvents.ENTITY_CREATED, (entity: Entity) => {
    //   this.eventQueue.addEventListener(SystemEvents.ENTITY_CREATED, () => {
    //     this.addEntity(entity);
    //   });
    // });

    // system.on(SystemEvents.ENTITY_DESTROYED, (entityId: EntityId) => {
    //   this.eventQueue.addEventListener(SystemEvents.ENTITY_DESTROYED, () => {
    //     this.removeEntity(this.entities.get(entityId)!);
    //   });
    // });

    // System.on(SystemEvents.COMPONENT_ATTACHED, (entityId: EntityId) => {
    //   this.componentIndex.addEntity(this.entities.get(entityId)!);
    // });

    // System.on(SystemEvents.COMPONENT_DETACHED, (entityId: EntityId) => {
    //   this.componentIndex.removeEntity(this.entities.get(entityId)!);
    // });

    // System.on(SystemEvents.ENTITY_CREATED, (entity: Entity) => {
    //   this.addEntity(entity);
    // });

    // System.on(SystemEvents.ENTITY_DESTROYED, (entityId: EntityId) => {
    //   this.removeEntity(this.entities.get(entityId)!);
    // });

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

    // this.eventQueue.processEventListeners();
    System.events.processEventListeners();
  }
}
