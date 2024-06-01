/**
 * @file Entity.ts
 * This file contains the definition of the Entity class, which represents an entity in the cluster with a unique identifier and a collection of components.
 * @header
 * @author @that.webdev.dude
 * @date 2024
 */

import { Cmath } from "../tools/Cmath";
import { Component } from "./Component";

/**
 * Represents an entity in the cluster.
 */
export class Entity {
  /**
   * The unique identifier of the entity.
   */
  readonly id: string = Cmath.randId(6);

  /**
   * The map of components attached to the entity.
   */
  readonly components: Map<string, Component> = new Map();

  /**
   * Attaches a component to the entity.
   * @param component - The component to attach.
   */
  attach(component: Component): void {
    this.components.set(component.type, component);
  }

  /**
   * Detaches a component from the entity.
   * @param component - The component to detach.
   */
  detach(component: Component): void {
    this.components.delete(component.type);
  }

  /**
   * Gets a specific component attached to the entity.
   * @param component - The name of the component to get.
   * @returns The component, or undefined if not found.
   */
  getComponent(component: string): Component | undefined {
    return this.components.get(component);
  }

  /**
   * Checks if the entity has a specific component attached.
   * @param component - The name of the component to check.
   * @returns True if the entity has the component, false otherwise.
   */
  has(component: string): boolean {
    return this.components.has(component);
  }

  /**
   * Checks if the entity has all of the specified components attached.
   * @param components - An array of component names to check.
   * @returns True if the entity has all of the components, false otherwise.
   */
  hasAll(components: string[]): boolean {
    return components.every((component) => this.components.has(component));
  }

  /**
   * Checks if the entity has any of the specified components attached.
   * @param components - An array of component names to check.
   * @returns True if the entity has any of the components, false otherwise.
   */
  hasAny(components: string[]): boolean {
    return components.some((component) => this.components.has(component));
  }

  /**
   * Checks if the entity has none of the specified components attached.
   * @param components - An array of component names to check.
   * @returns True if the entity has none of the components, false otherwise.
   */
  hasNone(components: string[]): boolean {
    return components.every((component) => !this.components.has(component));
  }

  /**
   * Gets all the components attached to the entity.
   * @returns An array of components.
   */
  getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Gets the names of all the components attached to the entity.
   * @returns An array of component names.
   */
  getComponentNames(): string[] {
    return Array.from(this.components.keys());
  }
}
