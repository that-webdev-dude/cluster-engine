import type {
    Archetype,
    ComponentColumns,
    ComponentSchema,
    ComponentAccessors,
    ComponentDescriptor,
    ComponentFieldAccessors,
    ComponentPrimitive,
} from "./types/component";

export interface ChunkView<S extends ComponentSchema = ComponentSchema> {
    readonly id: number;
    readonly count: number;
    readonly components: ComponentAccessors<S>;
    readonly meta: (row: number) => {
        archetype: Archetype<S>;
        generation: number;
        chunkId: number;
        row: number;
    };
}

export class Chunk<S extends ComponentSchema> {
    static readonly DEFAULT_CAPACITY = 256;

    private destroyed: boolean = false;

    private countValue: number = 0;

    private generations: number[];

    private columns: ComponentColumns<S> | null;

    private readonly schemaComponents: Map<string, S[number]>;

    readonly accessors: ComponentAccessors<S>;

    readonly capacity: number;

    readonly view: ChunkView<S>;

    constructor(
        readonly archetype: Archetype<S>,
        readonly id: number,
        readonly debug?: boolean,
    ) {
        this.capacity = archetype.maxEntities || Chunk.DEFAULT_CAPACITY;

        this.generations = new Array(this.capacity).fill(0);

        this.schemaComponents = new Map(
            archetype.schema.map((component) => [component.name, component]),
        );

        const columns = this.buildColumns();
        Object.freeze(columns);
        this.columns = columns;

        const accessors = this.buildAccessors();
        Object.freeze(accessors);
        this.accessors = accessors;

        const view = this.buildView();
        Object.freeze(view);
        this.view = view;
    }

    get byteCapacity(): number {
        this.assertAlive();
        return 0;
    }

    get count(): number {
        this.assertAlive();
        return this.countValue;
    }

    get full(): boolean {
        this.assertAlive();
        return this.count >= this.capacity;
    }

    getGeneration(row: number): number {
        this.assertAlive();
        if (row < 0 || row >= this.capacity) {
            throw new Error(`Chunk.getGeneration: row ${row} out of bounds`);
        }
        return this.generations[row];
    }

    getMeta(row: number): {
        archetype: Archetype<S>;
        generation: number;
        chunkId: number;
        row: number;
    } {
        this.assertAlive();
        if (row < 0 || row >= this.count) {
            throw new Error(
                `Chunk.getMeta: row ${row} out of range (count: ${this.count})`,
            );
        }
        return {
            archetype: this.archetype,
            generation: this.generations[row],
            chunkId: this.id,
            row,
        };
    }

    allocate(): { row: number; generation: number } {
        this.assertAlive();

        if (this.count >= this.capacity) {
            throw new Error(
                `Chunk.allocate: chunk is full (capacity: ${this.capacity})`,
            );
        }

        const row = this.count;
        const generation = this.generations[row];

        this.writeDefaults(row);
        this.incrementCount();

        return { row, generation };
    }

    delete(row: number): {
        row: number;
        generation: number;
        movedRow: number | undefined;
    } {
        this.assertAlive();

        if (this.count <= 0) {
            throw new Error(`Chunk.delete: chunk is empty, nothing to delete`);
        }

        const lastRow = this.count - 1;
        if (row < 0 || row >= this.count) {
            throw new Error(
                `Chunk.delete: row ${row} out of bounds (count: ${this.count}, archetype: ${this.archetype.name})`,
            );
        }

        if (row === lastRow) {
            this.generations[row]++;
            this.decrementCount();
            return {
                row: row,
                generation: this.generations[row] - 1,
                movedRow: undefined,
            };
        }

        for (const type of this.archetype.types) {
            const d = this.archetype.descriptors.byType.get(type);
            if (d === undefined)
                throw new Error(
                    `Chunk.delete: descriptor for type ${type} not found`,
                );

            const column = this.getColumn(d);

            const elems = d.count;
            const src = lastRow * elems;
            const dst = row * elems;

            column.copyWithin(dst, src, src + elems);
        }

        this.generations[row] = this.generations[lastRow];

        this.generations[lastRow]++;

        this.decrementCount();

        return {
            row: row,
            generation: this.generations[row],
            movedRow: lastRow,
        };
    }

    dispose(): void {
        if (this.destroyed) return;

        this.destroyed = true;

        this.countValue = 0;
        this.columns = null;
        this.generations = [];

        if (this.debug) {
            console.log("Chunk.dispose: chunk disposed");
        }
    }

    private getColumn<T extends ComponentPrimitive[]>(
        descriptor: ComponentDescriptor,
    ): T {
        this.assertAlive();
        const columnMap = this.columns;
        if (!columnMap) {
            throw new Error(
                `Chunk.getColumn: column map missing for descriptor ${descriptor.name}`,
            );
        }
        const column = (columnMap as any)[descriptor.name] as T | undefined;
        if (!column) {
            throw new Error(
                `Chunk.getColumn: column for ${descriptor.name} not found`,
            );
        }
        return column;
    }

    private writeDefaults(row: number) {
        for (const type of this.archetype.types) {
            const descriptor = this.archetype.descriptors.byType.get(type);
            if (!descriptor) {
                throw new Error(
                    `Chunk.allocate: descriptor for type ${type} not found`,
                );
            }
            const defaults = descriptor.defaults;
            if (defaults.length !== descriptor.count) {
                throw new Error(
                    `Chunk.allocate: default count mismatch for ${descriptor.name}`,
                );
            }
            const column = this.getColumn(descriptor);
            const base = row * descriptor.count;
            for (let i = 0; i < descriptor.count; i++) {
                column[base + i] = defaults[i];
            }
        }
    }

    private buildColumns(): ComponentColumns<S> {
        const map = Object.create(null) as Record<
            string,
            ComponentPrimitive[]
        >;

        for (const type of this.archetype.types) {
            const descriptor = this.archetype.descriptors.byType.get(type);
            if (descriptor === undefined)
                throw new Error(
                    `Chunk.buildColumns: descriptor for type ${type} not found`,
                );

            const column = new Array<ComponentPrimitive>(
                this.capacity * descriptor.count,
            );

            map[descriptor.name] = column;
        }

        return map as ComponentColumns<S>;
    }

    private incrementCount(): void {
        const currentCount = this.count;
        if (currentCount >= this.capacity) {
            throw new Error("Chunk.incrementCount: chunk is full");
        }
        this.countValue = currentCount + 1;
    }

    private decrementCount(): void {
        const currentCount = this.count;
        if (currentCount === 0) {
            throw new Error("Chunk.decrementCount: chunk is empty");
        }
        this.countValue = currentCount - 1;
    }

    private assertAlive(): void {
        if (this.destroyed) {
            throw new Error("Chunk.assertAlive: chunk has been destroyed");
        }
    }

    private buildAccessors(): ComponentAccessors<S> {
        const accessorMap = {} as ComponentAccessors<S>;

        for (const type of this.archetype.types) {
            const descriptor = this.archetype.descriptors.byType.get(type);
            if (!descriptor) {
                throw new Error(
                    `Chunk.buildAccessors: descriptor for type ${type} not found`,
                );
            }

            const schemaComponent = this.schemaComponents.get(descriptor.name);
            if (!schemaComponent) {
                throw new Error(
                    `Chunk.buildAccessors: schema component for type ${descriptor.name} not found`,
                );
            }

            const stride = descriptor.count;

            const mutableAccessors: Record<
                string,
                ComponentFieldAccessors<
                    typeof schemaComponent
                >[keyof ComponentFieldAccessors<typeof schemaComponent>]
            > = Object.create(null);

            let fieldIndex = 0;
            for (const fieldName of descriptor.fields) {
                const currentIndex = fieldIndex;
                const accessor = ((row: number, value?: ComponentPrimitive) => {
                    this.assertAlive();
                    if (row < 0 || row >= this.capacity) {
                        throw new Error(
                            `Chunk.accessors.${descriptor.name}.${fieldName}: row ${row} out of bounds`,
                        );
                    }

                    const column = this.getColumn(descriptor);
                    const elementIndex = row * stride + currentIndex;
                    if (value === undefined) {
                        return column[elementIndex];
                    }
                    column[elementIndex] = value;
                }) as ComponentFieldAccessors<
                    typeof schemaComponent
                >[keyof ComponentFieldAccessors<typeof schemaComponent>];

                mutableAccessors[fieldName] = accessor;
                fieldIndex += 1;
            }

            const fieldAccessors = Object.freeze(
                mutableAccessors as ComponentFieldAccessors<
                    typeof schemaComponent
                >,
            );

            accessorMap[schemaComponent.name as keyof ComponentAccessors<S>] =
                fieldAccessors as ComponentAccessors<S>[keyof ComponentAccessors<S>];
        }

        return accessorMap;
    }

    private buildView(): ChunkView<S> {
        const view = {
            components: this.accessors,
            meta: this.getMeta.bind(this),
        } as ChunkView<S>;

        Object.defineProperty(view, "count", {
            get: () => this.count,
            enumerable: true,
            configurable: false,
        });

        Object.defineProperty(view, "id", {
            get: () => this.id,
            enumerable: true,
            configurable: false,
        });

        return view;
    }
}
