import type { GameSystem } from "../service/Game.types";

export type SystemConfig = Readonly<{
    id: string;
    phase?: GameSystem["phase"];
    execute: GameSystem["execute"];
    advanced?: {
        order?: number;
        group?: string;
        groupOrder?: number;
    };
}>;

export function system(config: SystemConfig): GameSystem {
    const { order = 0, group = "main", groupOrder = 0 } = config.advanced ?? {};
    return Object.freeze({
        id: config.id,
        phase: config.phase ?? "fixedUpdate",
        order: order,
        group: group,
        groupOrder: groupOrder,
        execute: config.execute,
    });
}
