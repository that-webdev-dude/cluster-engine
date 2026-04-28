/** deprecated */
export type SystemOwnerId = number | string;

/** deprecated */
export type System<P, C, R> = {
    id: string;
    phase: P;
    order: number;
    group: string;
    groupOrder: number;
    execute: (ctx: C, run: R) => void;
};
