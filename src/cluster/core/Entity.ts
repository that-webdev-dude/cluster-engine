import { Cmath } from "../tools/Cmath";
import { Component } from "./Component";

export class Entity {
  readonly id: string;
  readonly type: string;
  public dead: boolean;
  readonly components: Map<string, Component>;

  constructor(type?: string) {
    this.id = Cmath.randId(6);
    this.type = type || this.constructor.name;
    this.dead = false;
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

  // hasAllComponents(
  //   componentClasses: (new (...args: any[]) => Component)[]
  // ): boolean {
  //   return componentClasses.every((componentClass) =>
  //     this.components.has(componentClass.name)
  //   );
  // }
}
