import { Cmath } from "../tools/Cmath";
import { Container } from "./Container";
import { Component } from "./Component";

export class Entity {
  readonly id: string;
  readonly type: string;
  readonly components: Map<string, Component>;

  constructor(type?: string) {
    this.id = Cmath.randId(6);
    this.type = type || this.constructor.name;
    this.components = new Map();
  }

  attachComponent(component: Component): void {
    this.components.set(component.constructor.name, component);
  }

  detachComponent(component: Component): void {
    this.components.delete(component.constructor.name);
  }

  getComponent<T extends Component>(
    componentClass: new (...args: any[]) => T
  ): T | undefined {
    return this.components.get(componentClass.name) as T;
  }

  hasComponent<T extends Component>(
    componentClass: new (...args: any[]) => T
  ): boolean {
    return this.components.has(componentClass.name);
  }

  hasComponents(...componentClasses: any[]): boolean {
    return componentClasses.every((componentClass) =>
      this.components.has(componentClass.name)
    );
  }
}

export class EntityContainer extends Entity {
  readonly entities: Container<Entity>;

  constructor(type?: string) {
    super(type);
    this.entities = new Container<Entity>();
  }

  add(entity: Entity): void {
    this.entities.add(entity);
  }

  remove(entity: Entity): void {
    this.entities.remove(entity);
  }

  clear(): void {
    this.entities.clear();
  }

  filter(fn: (entity: Entity) => boolean): EntityContainer {
    const result = new EntityContainer();
    this.entities.forEach((entity) => {
      if (fn(entity)) {
        result.add(entity);
      }
    });
    return result;
  }

  forEach(fn: (entity: Entity, id: number) => void): void {
    this.entities.forEach(fn);
  }
}
