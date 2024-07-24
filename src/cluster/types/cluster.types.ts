import { Entity } from "../core/Entity";
import { Vector } from "../tools/Vector";

export namespace Cluster {
  export type EntityGenerator<T extends Entity> = (...args: any[]) => T | T[];
  export type Creator<T> = (...args: any[]) => T;
  export type Updater<T> = (args: any) => T;

  export type Degrees = number;

  export type ITest = {
    test: string;
  };

  export interface CollisionData {
    other: Entity;
    overlap: Vector;
    normal: Vector;
    area: number;
  }
}
