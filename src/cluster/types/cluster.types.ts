import { Entity } from "../core/Entity";

export namespace Cluster {
  export type EntityGenerator<T extends Entity> = (...args: any[]) => T | T[];
  export type Creator<T> = (...args: any[]) => T;
  export type Updater<T> = (args: any) => T;
}
