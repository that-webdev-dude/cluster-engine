import { Entity } from "../core/Entity";

export namespace Cluster {
  export type EntityGenerator<T extends Entity> = (...args: any[]) => T | T[];
}
