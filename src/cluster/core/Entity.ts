import { Cmath } from "../tools/Cmath";
import { Component } from "./Component";

export class Entity {
  readonly id: string = Cmath.randId(6);
  readonly components: Map<string, Component> = new Map();

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

  hasAllComponents(
    componentClasses: (new (...args: any[]) => Component)[]
  ): boolean {
    return componentClasses.every((componentClass) =>
      this.components.has(componentClass.name)
    );
  }

  hasComponent<T extends Component>(
    componentClass: new (...args: any[]) => T
  ): boolean {
    return this.components.has(componentClass.name);
  }

  // getComponents(): Component[] {
  //   return Array.from(this.components.values());
  // }

  // getComponentNames(): string[] {
  //   return Array.from(this.components.keys());
  // }

  // hasComponent(component: string): boolean {
  //   return this.components.has(component);
  // }

  // hasAllComponents(components: string[]): boolean {
  //   return components.every((component) => this.components.has(component));
  // }

  // hasAnyComponent(components: string[]): boolean {
  //   return components.some((component) => this.components.has(component));
  // }

  // hasNoneOfComponents(components: string[]): boolean {
  //   return components.every((component) => !this.components.has(component));
  // }
}
