export type ComponentPrimitive = number | string;

export type ComponentColumn = ComponentPrimitive[];

export type Component = {
    name: string;
    fields: Readonly<Record<string, number>>;
};

export type ComponentSchema = ReadonlyArray<Component>;

export type ComponentConfigMap<S extends ComponentSchema> = {
    [C in S[number] as C["name"]]?: {
        [K in keyof C["fields"]]?: ComponentPrimitive;
    };
};

export type ComponentValueMap = Record<number, ReadonlyArray<ComponentPrimitive>>;

export type ComponentDescriptor = Readonly<{
    type: number;
    name: string;
    count: number;
    defaults: ReadonlyArray<ComponentPrimitive>;
    fields: ReadonlySet<string>;
}>;

export type Archetype<S extends ComponentSchema> = Readonly<{
    descriptors: Readonly<{
        byName: ReadonlyMap<string, ComponentDescriptor>;
        byType: ReadonlyMap<number, ComponentDescriptor>;
    }>;
    offsets: ReadonlyMap<number, number>;
    types: ReadonlyArray<number>;
    name: string;
    schema: S;
    signature: bigint;
    // Retained for compatibility with current archetype metadata. Array-backed
    // v1 chunks do not use byte layout for component columns.
    byteStride: number;
    elementStride: number;
    maxEntities?: number;
}>;

export type ComponentColumns<S extends ComponentSchema> = {
    [K in S[number] as K["name"]]: ComponentColumn;
};

export type ComponentFieldAccessors<C extends Component> = {
    [F in keyof C["fields"] & string]: {
        (i: number): ComponentPrimitive;
        (i: number, v: ComponentPrimitive): void;
    };
};

export type ComponentAccessors<S extends ComponentSchema> = {
    [K in S[number] as K["name"]]: ComponentFieldAccessors<K>;
};

export type ComponentFieldAccessor = (
    row: number,
    value?: ComponentPrimitive,
) => ComponentPrimitive | void;

export type ComponentAccessorLookup<S extends ComponentSchema> =
    ComponentAccessors<S> & {
        [componentName: string]: {
            [field: string]: ComponentFieldAccessor;
        };
    };
