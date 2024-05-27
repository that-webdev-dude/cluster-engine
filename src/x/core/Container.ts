import { Entity } from "./Entity";

export class Container {
  components: Map<string, Map<string, any>> = new Map();

  add(entity: Entity) {
    const components = entity.getComponents();
    for (const component of components) {
      if (!this.components.has(component.type)) {
        this.components.set(component.type, new Map());
      }
      this.components.get(component.type)?.set(entity.id, component);
    }
  }

  remove(entity: Entity) {
    const components = entity.getComponents();
    for (const component of components) {
      this.components.get(component.type)?.delete(entity.id);
    }
  }

  get(component: string) {
    const componentMap = this.components.get(component);
    return componentMap ? Array.from(componentMap.values()) : [];
  }
}
