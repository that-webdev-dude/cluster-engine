/** deprecated */
export type SystemOwnerId = number | string;

/** deprecated */
export type System<C, R> = {
    id: string;
    phase: "input" | "fixedUpdate" | "preRender";
    order: number;
    group: string;
    groupOrder: number;
    execute: (ctx: C, run: R) => void;
};
