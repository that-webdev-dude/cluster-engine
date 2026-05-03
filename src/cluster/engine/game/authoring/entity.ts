import type { GameEntity } from "../service/Game.types";
import type {
    EntityComponent,
    EntityComponentPrimitive,
    EntityId,
} from "../../managers/world/entity";

export type EntityComponentConfig = Readonly<
    Record<string, EntityComponentPrimitive>
>;

export type EntityComponentsConfig = Readonly<
    Record<string, EntityComponentConfig>
>;

export type EntityConfig = GameEntity;

export function entity(config: EntityConfig): GameEntity;
export function entity(
    id: EntityId,
    components: EntityComponentsConfig,
): GameEntity;
export function entity(
    configOrId: EntityConfig | EntityId,
    components?: EntityComponentsConfig,
): GameEntity {
    const config =
        typeof configOrId === "string"
            ? { id: configOrId, ...(components ?? {}) }
            : configOrId;

    const authored: Record<string, EntityId | EntityComponent> = {
        id: config.id,
    };

    for (const [componentName, component] of Object.entries(config)) {
        if (componentName === "id") continue;
        if (!component || typeof component !== "object") continue;
        authored[componentName] = Object.freeze({ ...component });
    }

    return Object.freeze(authored) as GameEntity;
}
