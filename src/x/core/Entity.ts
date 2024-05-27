import { Cmath } from "../tools/Cmath";
import { Component } from "./Component";

export class Entity {
  readonly id: string = Cmath.randId(6);
  readonly components: Map<string, Component> = new Map();
  attach(component: Component) {
    this.components.set(component.type, component);
  }
  detach(component: Component) {
    this.components.delete(component.type);
  }
  get(component: string) {
    return this.components.get(component);
  }
  has(component: string) {
    return this.components.has(component);
  }
  hasAll(components: string[]) {
    return components.every((component) => this.components.has(component));
  }
  hasAny(components: string[]) {
    return components.some((component) => this.components.has(component));
  }
  hasNone(components: string[]) {
    return components.every((component) => !this.components.has(component));
  }
  getComponents() {
    return Array.from(this.components.values());
  }
  getComponentNames() {
    return Array.from(this.components.keys());
  }
  getComponent(component: string) {
    return this.components.get(component);
  }
}
