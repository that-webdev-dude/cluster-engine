import type {
    Archetype,
    ComponentAccessorLookup,
    ComponentConfigMap,
    ComponentFieldAccessor,
    ComponentPrimitive,
    ComponentSchema,
} from "./types/component";
import type { EntityMeta } from "./types/entity";
import { Chunk, type ChunkView } from "./chunk";
import { ID } from "../tools/ID";

export class Storage<S extends ComponentSchema> {
    private readonly chunks: Map<number, Chunk<S>> = new Map();

    private readonly chunkIdPool: ID<number> = new ID();

    private readonly partialChunkIds: Set<number> = new Set();

    private liveRecords: number = 0;

    constructor(readonly archetype: Archetype<S>) {}

    get entityCount() {
        return this.liveRecords;
    }

    get chunkCount(): number {
        return this.chunks.size;
    }

    get isEmpty(): boolean {
        return this.liveRecords === 0;
    }

    allocate(comps?: ComponentConfigMap<S>): EntityMeta<S> {
        if (comps) {
            this.validateOverrides(comps);
        }

        if (
            this.archetype.maxEntities &&
            this.liveRecords >= this.archetype.maxEntities
        )
            throw new Error(
                `Storage.allocate: the storage for "${this.archetype.name}" has a limited number of entities set to ${this.archetype.maxEntities}`,
            );

        let chunkId = this.findAvailableChunk();
        if (chunkId === undefined) {
            chunkId = this.createChunk();
            this.partialChunkIds.add(chunkId);
        }

        const chunk = this.getChunk(chunkId)!;

        const { row, generation } = chunk.allocate();

        if (row === chunk.capacity - 1) {
            this.partialChunkIds.delete(chunkId);
        }

        this.liveRecords++;

        if (comps) {
            this.assign(chunkId, row, generation, comps, true);
        }

        return chunk.getMeta(row);
    }

    assign(
        chunkId: number,
        row: number,
        generation: number,
        comps: ComponentConfigMap<S>,
        skipValidation: boolean,
    ): EntityMeta<S> | undefined {
        const chunk = this.validateChunkAndGeneration(chunkId, row, generation);
        if (!chunk) return undefined;

        if (!skipValidation) {
            this.validateOverrides(comps);
        }

        const accessorsByComponent =
            chunk.accessors as ComponentAccessorLookup<S>;

        for (const [typeStr, value] of Object.entries(comps)) {
            if (!value) continue;

            this.assignComponentFields(
                accessorsByComponent,
                row,
                typeStr,
                value as Record<string, ComponentPrimitive>,
                skipValidation,
            );
        }

        return chunk.getMeta(row);
    }

    delete(
        chunkId: number,
        row: number,
        generation: number,
    ):
        | {
              meta: EntityMeta<S>;
              movedRow: number | undefined;
          }
        | undefined {
        const chunk = this.getChunk(chunkId);
        if (!chunk) {
            throw new Error(
                `Storage.delete: illegal attempt to delete - the chunkId ${chunkId} doesn't exists`,
            );
        }

        if (chunk.count === 0) {
            console.warn(`Storage.delete: the chunk is already empty !!!!`);
            return undefined;
        }

        if (chunk.getGeneration(row) !== generation) return undefined;

        const {
            row: newRow,
            generation: returnedGeneration,
            movedRow,
        } = chunk.delete(row);

        this.liveRecords--;

        if (chunk.count < 0)
            console.warn(`Storage.delete: the chunk has a count < 0 !!!!`);

        const remainingCount = chunk.count;
        if (remainingCount === 0) {
            this.destroyChunk(chunkId);
        } else if (!chunk.full) {
            this.partialChunkIds.add(chunkId);
        }

        const meta: EntityMeta<S> =
            movedRow === undefined
                ? {
                      archetype: this.archetype,
                      generation: returnedGeneration,
                      chunkId,
                      row: newRow,
                  }
                : chunk.getMeta(newRow);

        return {
            meta,
            movedRow,
        };
    }

    clear(): void {
        const chunkIds = Array.from(this.chunks.keys());
        for (const chunkId of chunkIds) {
            this.destroyChunk(chunkId);
        }

        this.chunks.clear();
        this.partialChunkIds.clear();
        this.liveRecords = 0;
    }

    dispose(): void {
        this.clear();
    }

    [Symbol.iterator](): IterableIterator<ChunkView<S>> {
        function* chunkViewGenerator(
            chunks: Map<number, Chunk<S>>,
        ): IterableIterator<ChunkView<S>> {
            for (const chunk of chunks.values()) {
                yield chunk.view;
            }
        }
        return chunkViewGenerator(this.chunks);
    }

    private validateOverrides(comps?: ComponentConfigMap<S>): void {
        if (!comps) return;

        for (const [typeName, overrides] of Object.entries(comps)) {
            if (!overrides) continue;

            const descriptor = this.archetype.descriptors.byName.get(typeName);
            if (!descriptor) {
                throw new Error(
                    `Storage.validateOverrides: component ${typeName} is not part of archetype ${this.archetype.name}`,
                );
            }

            for (const [fieldName, value] of Object.entries(overrides)) {
                if (!descriptor.fields.has(fieldName)) {
                    throw new Error(
                        `Storage.validateOverrides: field ${typeName}.${fieldName} is not defined in the schema`,
                    );
                }
                if (!isComponentPrimitive(value)) {
                    throw new TypeError(
                        `Storage.validateOverrides: field ${typeName}.${fieldName} must be a finite number or string`,
                    );
                }
            }
        }
    }

    private validateChunkAndGeneration(
        chunkId: number,
        row: number,
        generation: number,
    ): Chunk<S> | undefined {
        const chunk = this.chunks.get(chunkId);
        if (!chunk) {
            throw new Error(
                `Storage.assign: illegal assignement - the chunkId ${chunkId} doesn't exists`,
            );
        }

        if (chunk.getGeneration(row) !== generation) {
            return undefined;
        }

        return chunk;
    }

    private assignComponentFields(
        accessorsByComponent: ComponentAccessorLookup<S>,
        row: number,
        typeStr: string,
        value: Record<string, ComponentPrimitive> | undefined,
        skipValidation: boolean,
    ): void {
        if (!value) return;

        const descriptor = this.archetype.descriptors.byName.get(typeStr);
        if (!descriptor) {
            throw new Error(
                `Storage.assign: component ${typeStr} is not in archetype ${this.archetype.name}`,
            );
        }

        const componentAccessors = accessorsByComponent[descriptor.name];
        if (!componentAccessors) {
            throw new Error(
                `Storage.assign: component ${descriptor.name} is not in chunk schema`,
            );
        }

        for (const [fieldName, overrideValue] of Object.entries(value)) {
            if (overrideValue === undefined) continue;

            this.assignFieldValue(
                componentAccessors,
                row,
                fieldName,
                overrideValue,
                descriptor,
                skipValidation,
            );
        }
    }

    private assignFieldValue(
        componentAccessors: { [field: string]: ComponentFieldAccessor },
        row: number,
        fieldName: string,
        overrideValue: ComponentPrimitive,
        descriptor: { name: string },
        skipValidation: boolean,
    ): void {
        const accessor = componentAccessors[fieldName];
        if (!accessor) {
            if (!skipValidation) {
                throw new Error(
                    `Storage.assign: field ${descriptor.name}.${fieldName} is not defined in the schema`,
                );
            }
            return;
        }

        accessor(row, overrideValue);
    }

    private findAvailableChunk(): number | undefined {
        return this.partialChunkIds.values().next().value;
    }

    private createChunk(): number {
        const chunkId = this.chunkIdPool.acquire();

        this.chunks.set(chunkId, new Chunk<S>(this.archetype, chunkId));

        return chunkId;
    }

    private destroyChunk(chunkId: number) {
        const chunk = this.chunks.get(chunkId);
        if (!chunk) {
            throw new Error(
                `Storage.destroyChunk: illegal attempt to destroy - the chunkId ${chunkId} doesn't exists`,
            );
        }

        chunk.dispose();

        this.partialChunkIds.delete(chunkId);
        this.chunkIdPool.release(chunkId);
        this.chunks.delete(chunkId);
    }

    private getChunk(chunkId: number): Chunk<S> | undefined {
        return this.chunks.get(chunkId);
    }
}

function isComponentPrimitive(value: unknown): value is ComponentPrimitive {
    if (typeof value === "string") return true;
    return typeof value === "number" && Number.isFinite(value);
}
