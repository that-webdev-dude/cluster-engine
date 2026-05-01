export class ID<T extends number> {
    private readonly first: T;

    private nextId: T;

    private freeIds: Set<T> = new Set();

    constructor(first?: T) {
        this.first = first ?? (0 as T);
        this.nextId = this.first;
    }

    acquire(): T {
        const next = this.freeIds.values().next();
        if (!next.done) {
            this.freeIds.delete(next.value);
            return next.value;
        }

        return this.nextId++ as T;
    }

    release(id: T): void {
        if (id >= this.first && id < this.nextId && !this.freeIds.has(id)) {
            this.freeIds.add(id);
        }
    }

    reset(): void {
        this.nextId = this.first;
        this.freeIds.clear();
    }

    getStats(): { nextId: T; freeCount: number } {
        return {
            nextId: this.nextId,
            freeCount: this.freeIds.size,
        };
    }
}
