export type SystemOwnerId = number | string;

export type SystemPhase = "input" | "fixedUpdate" | "preRender";

export type System<C, R> = Readonly<{
    id: string;
    phase: SystemPhase;
    order: number;
    group: string;
    groupOrder: number;
    execute(ctx: C, run: R): void;
}>;
