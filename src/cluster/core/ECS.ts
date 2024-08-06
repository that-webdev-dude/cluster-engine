import { EventEmitter } from "events";

type EntityId = number;

export class Entity extends EventEmitter {
  id: EntityId;
  components: Map<string, Component>;
  dead: boolean;

  constructor(id: EntityId) {
    super();
    this.id = id;
    this.components = new Map();
    this.dead = false;
  }

  addComponent(component: Component) {
    const componentName = component.constructor.name;
    this.components.set(componentName, component);
    this.emit("componentsChanged", this.id, componentName, "added");
  }

  addComponents(components: Component[]) {
    for (let component of components) {
      this.addComponent(component);
    }
  }

  attachComponent(component: Component) {
    this.addComponent(component);
  }

  attachComponents(...components: Component[]) {
    for (let component of components) {
      this.addComponent(component);
    }
  }

  removeComponent(componentName: string) {
    this.components.delete(componentName);
    this.emit("componentsChanged", this.id, componentName, "removed");
  }

  removeComponents(componentNames: string[]) {
    for (let componentName of componentNames) {
      this.removeComponent(componentName);
    }
  }

  detachComponent(component: Component) {
    this.removeComponent(component.constructor.name);
  }

  detachComponents(...components: Component[]) {
    for (let component of components) {
      this.removeComponent(component.constructor.name);
    }
  }

  hasComponent(componentName: string): boolean {
    return this.components.has(componentName);
  }

  hasComponents(componentNames: string[]): boolean {
    return componentNames.every((componentName) =>
      this.components.has(componentName)
    );
  }

  markAsDead() {
    this.dead = true;
    this.emit("statusChanged", this.id, "dead");
  }
}

export class Component {
  // Base class for all components
}

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
}

export class System {
  componentsRequired: string[];

  constructor(componentsRequired: string[]) {
    this.componentsRequired = componentsRequired;
  }

  update(entities: Set<Entity>) {
    // To be implemented by specific systems
  }
}

export class Scene {
  private entities: Map<EntityId, Entity>;
  private systems: System[];
  private componentIndex: ComponentIndex;
  private pendingChanges: {
    entityId: EntityId;
    componentName?: string;
    action: "added" | "removed" | "dead";
  }[];

  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.componentIndex = new ComponentIndex();
    this.pendingChanges = [];
  }

  addEntity(entity: Entity) {
    this.entities.set(entity.id, entity);
    this.componentIndex.addEntity(entity);

    entity.on(
      "componentsChanged",
      (
        entityId: EntityId,
        componentName: string,
        action: "added" | "removed"
      ) => {
        this.pendingChanges.push({ entityId, componentName, action });
      }
    );

    entity.on("statusChanged", (entityId: EntityId, status: "dead") => {
      this.pendingChanges.push({ entityId, action: status });
    });
  }

  removeEntity(entity: Entity) {
    this.entities.delete(entity.id);
    this.componentIndex.removeEntity(entity);
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  update(dt: number, t: number) {
    for (let system of this.systems) {
      const entities = this.componentIndex.getEntitiesWithComponents(
        system.componentsRequired
      );
      system.update(entities);
    }

    this.applyPendingChanges();
  }

  private applyPendingChanges() {
    for (let change of this.pendingChanges) {
      const entity = this.entities.get(change.entityId);
      if (!entity) continue;

      if (change.action === "added") {
        this.componentIndex.addEntity(entity);
      } else if (change.action === "removed") {
        this.componentIndex.removeEntity(entity);
      } else if (change.action === "dead") {
        this.removeEntity(entity);
      }
    }

    this.pendingChanges = [];
  }
}
