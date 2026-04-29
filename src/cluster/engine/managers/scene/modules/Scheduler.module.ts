import type { System, SystemOwnerId } from "../../../types/system";

export type SchedulerRegistration<P, C, R> = {
    ownerId: SystemOwnerId;
    system: System<P, C, R>;
};

export type SchedulerExecuteArgs<P, C, R> = {
    ctx: C;
    run: R;
    phase: P;
    scopeIds: readonly SystemOwnerId[] | SystemOwnerId;
};

export type SystemMetadata<P, C, R> = System<P, C, R> & {
    ownerId: SystemOwnerId;
    registrationSequence: number;
};

export type Scheduler<P, C, R> = {
    register(registration: SchedulerRegistration<P, C, R>): void;
    unregister(ownerId?: SystemOwnerId): void;
    execute(args: SchedulerExecuteArgs<P, C, R>): void;
};

export function createScheduler<P, C, R>(
    debug: boolean = false,
): Scheduler<P, C, R> {
    let registrationSequence = 0;

    const systemsByOwnerId: Map<SystemOwnerId, SystemMetadata<P, C, R>[]> =
        new Map();

    function register(registration: SchedulerRegistration<P, C, R>) {
        const { ownerId, system } = registration;

        if (!systemsByOwnerId.has(ownerId)) {
            systemsByOwnerId.set(ownerId, []);
        }

        const systems = systemsByOwnerId.get(ownerId);
        if (systems?.find((t) => t.id === system.id) !== undefined) {
            if (debug) {
                throw new Error(
                    "SchedulerModule: attempt to add a system twice for the same scope!",
                );
            }
            return;
        }

        systems?.push({
            ...system,
            ownerId: ownerId,
            registrationSequence: registrationSequence++,
        });
    }

    function unregister(ownerId?: SystemOwnerId) {
        if (ownerId !== undefined) {
            const systems = systemsByOwnerId.get(ownerId);
            if (systems) {
                systems.length = 0;
                systemsByOwnerId.delete(ownerId);
            }
        } else {
            systemsByOwnerId.clear();
        }
    }

    function execute(args: SchedulerExecuteArgs<P, C, R>) {
        const execOwners = Array.isArray(args.scopeIds)
            ? args.scopeIds
            : [args.scopeIds];

        for (const ownerId of execOwners) {
            const systems = systemsByOwnerId.get(ownerId);
            if (!systems) continue;

            const systemsToExecute = systems
                .filter((system) => system.phase === args.phase)
                .slice()
                .sort((a, b) => {
                    if (a.groupOrder !== b.groupOrder) {
                        return a.groupOrder - b.groupOrder;
                    }

                    if (a.group !== b.group) {
                        return a.group.localeCompare(b.group);
                    }

                    if (a.order !== b.order) {
                        return a.order - b.order;
                    }

                    return a.registrationSequence - b.registrationSequence;
                });

            for (const system of systemsToExecute) {
                try {
                    system.execute(args.ctx, args.run);
                } catch (error) {
                    if (debug) {
                        throw new Error(
                            `SchedulerModule: system "${
                                system.id
                            }" failed during phase "${String(
                                args.phase,
                            )}": ${formatError(error)}`,
                        );
                    }
                }
            }
        }
    }

    function formatError(error: unknown): string {
        if (error instanceof Error) return error.message;
        return String(error);
    }

    return {
        execute,
        register,
        unregister,
    };
}
