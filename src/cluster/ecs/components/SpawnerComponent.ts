import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";
import { Vector } from "../../tools/Vector";

// Interface for component properties
export interface SpawnerOptions {
  spawnInterval: number;
  spawnCountMax?: number | null;
  spawnPosition: () => Vector;
  spawnTrigger?: () => boolean;
  spawnEntity: typeof Entity;
}

// Spawner Component
export class SpawnerComponent implements Component {
  private _spawnInterval: number;
  private _spawnCountMax: number | null;
  private _spawnPosition: () => Vector;
  private _spawnTrigger: (() => boolean) | undefined;
  private _spawnEntity: typeof Entity;
  private _spawnCount: number = 0;
  private _spawnElapsedTime: number;

  constructor({
    spawnInterval,
    spawnCountMax = null,
    spawnPosition,
    spawnTrigger,
    spawnEntity,
  }: SpawnerOptions) {
    if (spawnInterval <= 0) {
      throw new TypeError(
        "[SpawnerComponent constructor]: spawnInterval must be a positive number"
      );
    }
    if (spawnCountMax !== null && spawnCountMax <= 0) {
      throw new TypeError(
        "[SpawnerComponent constructor]: spawnCountMax must be a positive number"
      );
    }
    if (!spawnEntity) {
      throw new TypeError(
        "[SpawnerComponent constructor]: spawnEntity must be an entity type"
      );
    }

    this._spawnElapsedTime = 0;
    this._spawnInterval = spawnInterval;
    this._spawnCountMax = spawnCountMax;
    this._spawnPosition = spawnPosition;
    this._spawnTrigger = spawnTrigger;
    this._spawnEntity = spawnEntity;
  }

  get interval(): number {
    return this._spawnInterval;
  }

  set interval(value: number) {
    if (value <= 0) {
      throw new TypeError(
        "[SpawnerComponent setter]: value must be a positive number"
      );
    }
    this._spawnInterval = value;
  }

  get countMax(): number | null {
    return this._spawnCountMax;
  }

  set countMax(value: number | null) {
    if (value !== null && value <= 0) {
      throw new TypeError(
        "[SpawnerComponent setter]: value must be a positive number"
      );
    }
    this._spawnCountMax = value;
  }

  get count(): number {
    return this._spawnCount;
  }

  set count(value: number) {
    if (value < 0) {
      throw new TypeError(
        "[SpawnerComponent setter]: value must be a non-negative number"
      );
    }
    this._spawnCount = value;
  }

  get elapsedTime(): number {
    return this._spawnElapsedTime;
  }

  set elapsedTime(value: number) {
    if (value < 0) {
      throw new TypeError(
        "[SpawnerComponent setter]: value must be a non-negative number"
      );
    }
    this._spawnElapsedTime = value;
  }

  get entity(): typeof Entity {
    return this._spawnEntity;
  }

  get position(): Vector {
    return this._spawnPosition();
  }

  get hasTrigger(): boolean {
    return !!this._spawnTrigger;
  }

  get trigger(): boolean {
    return this._spawnTrigger ? this._spawnTrigger() : false;
  }
}
