import type { Archetype, ComponentConfigMap, ComponentSchema } from "./component";

export type EntityMeta<S extends ComponentSchema> = Readonly<{
    row: number;
    chunkId: number;
    generation: number;
    archetype: Archetype<S>;
}>;

export type EntityType<S extends ComponentSchema> = Readonly<{
    schema: S;
    config: ComponentConfigMap<S>;
    archetype: Archetype<S>;
}>;
