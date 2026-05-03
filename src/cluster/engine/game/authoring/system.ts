import type { GameSystem } from "../service/Game.types";

export type SystemConfig = Readonly<{
    id: string;
    phase?: GameSystem["phase"];
    order?: number;
    group?: string;
    groupOrder?: number;
    execute: GameSystem["execute"];
}>;

export function system(config: SystemConfig): GameSystem {
    return Object.freeze({
        id: config.id,
        phase: config.phase ?? "fixedUpdate",
        order: config.order ?? 0,
        group: config.group ?? "main",
        groupOrder: config.groupOrder ?? 0,
        execute: config.execute,
    });
}
