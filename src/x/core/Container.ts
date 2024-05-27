import { Entity } from "./Entity";

export class Container {
  private _components: Map<string, Map<string, any>> = new Map();

  addEntity(entity: Entity) {
    const components = entity.getComponents();
    for (const component of components) {
      let componentMap = this._components.get(component.type);
      if (!componentMap) {
        componentMap = new Map();
        this._components.set(component.type, componentMap);
      }
      componentMap.set(entity.id, component);
    }
  }

  removeEntity(entity: Entity) {
    const components = entity.getComponents();
    for (const component of components) {
      const componentMap = this._components.get(component.type);
      if (componentMap) {
        componentMap.delete(entity.id);
        // Optional: Clean up empty maps to save memory
        if (componentMap.size === 0) {
          this._components.delete(component.type);
        }
      }
    }
  }

  getEntitiesWith(components: string[] | string) {
    if (typeof components === "string") {
      const componentMap = this._components.get(components);
      return componentMap ? Array.from(componentMap.values()) : [];
    }

    if (components.length === 0) {
      return [];
    }

    const [firstComponent, ...restComponents] = components;
    const initialEntities = this._components.get(firstComponent);

    if (!initialEntities) {
      return [];
    }

    // Use the first component's entities as a starting point
    const entities = new Set(initialEntities.keys());

    for (const componentName of restComponents) {
      const componentMap = this._components.get(componentName);
      if (!componentMap) {
        return [];
      }

      entities.forEach((entity) => {
        if (!componentMap.has(entity)) {
          entities.delete(entity);
        }
      });

      // Early exit if no entities are left
      if (entities.size === 0) {
        return [];
      }
    }

    return Array.from(entities);
  }
}
