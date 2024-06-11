import { Cmath } from "../tools/Cmath";
import { Component } from "./Component";

// -----------
// const details = {
//   component: Components.Transform,
//   property: "Position",
//   value: new Vector(0, 0),
// };
// const component = entity.getComponent(details.component);
// if (component) {
//   const keys = Object.keys(component);
//   if (keys.includes(details.property)) {
//     Object.assign(component, {
//       [details.property]: spawner.position,
//     });
//   }
// }
// type ComponentPropertyValue = {
//   component: Component
//   property: string
//   value: any
// }
// -----------

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

  // apply(componentPropertyValue: ComponentPropertyValue): void {
  //   const component = this.getComponent(componentPropertyValue.component as any);
  //   if (component) {
  //     const keys = Object.keys(component);
  //     if (keys.includes(componentPropertyValue.property)) {
  //       Object.assign(component, {
  //         [componentPropertyValue.property]: componentPropertyValue.value,
  //       });
  //     }
  //   }
  // }

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
