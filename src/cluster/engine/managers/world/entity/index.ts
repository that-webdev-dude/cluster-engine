export type EntityId = string;

export type EntityComponentPrimitive = number | string;

export type EntityComponent = Readonly<
    Record<string, EntityComponentPrimitive>
>;

export type Entity = Readonly<{
    id: EntityId;
} & {
    [componentName: string]: EntityId | EntityComponent;
}>;
