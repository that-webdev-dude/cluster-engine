import { Container } from "./Container";
import { Entity } from "./Entity";

export abstract class System {
  update(entities: Container<Entity>, ...args: any[]): void {}
}
