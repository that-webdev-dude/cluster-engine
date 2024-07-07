import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Components } from "../index";
import { SpawnerComponent } from "../components/SpawnerComponent";

export class SpawnSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

  private _spawnEntity(spawner: SpawnerComponent): void {
    const spawn = spawner.generator();
    if (Array.isArray(spawn)) {
      this._entities.add(...spawn);
    } else {
      this._entities.add(spawn);
    }
    if (spawner.countMax !== null) {
      spawner.count++;
    }
  }

  private _shouldSpawn(spawner: SpawnerComponent, dt: number): boolean {
    spawner.elapsedTime += dt;
    if (spawner.elapsedTime >= spawner.interval) {
      spawner.elapsedTime = 0;
      return true;
    }
    return false;
  }

  private _processSpawner(spawner: SpawnerComponent, dt: number): void {
    if (this._shouldSpawn(spawner, dt)) {
      if (spawner.hasTrigger) {
        if (spawner.trigger) {
          this._spawnEntity(spawner);
        } else {
          spawner.elapsedTime = spawner.interval;
        }
      } else if (
        spawner.countMax === null ||
        spawner.count < spawner.countMax
      ) {
        this._spawnEntity(spawner);
      }
    }
  }

  update(entities: Container<Entity>, dt: number, t: number): void {
    this._entities.forEach((entity: Entity) => {
      const spawner = entity.getComponent(Components.Spawner);
      if (spawner) {
        this._processSpawner(spawner, dt);
      }
    });
  }
}
