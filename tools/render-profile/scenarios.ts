import type {
    Entity,
    WorldManagerService,
} from "../../src/cluster/engine/managers/world";
import { createWorldManager } from "../../src/cluster/engine/managers/world";
import { extractRenderFrameInput } from "../../src/cluster/engine/game/modules/RenderExtraction.module";
import type { RenderExtractionInput } from "../../src/cluster/engine/game/modules/RenderExtraction.module";
import type {
    RenderCircle2D,
    RenderFrameInput,
    RenderItem2D,
    RenderLine2D,
    RenderPolygon2D,
    RenderRect2D,
    RenderSprite2D,
} from "../../src/cluster/engine/services/render/service/Render.types";

export type RenderProfileScenarioName =
    | "rects-10k"
    | "sprites-10k"
    | "circles-5k"
    | "lines-10k"
    | "polygons-5k"
    | "mixed-10k"
    | "world-rects-1k"
    | "world-rects-10k";

export type RenderProfileScenarioSource = "renderer-only" | "world-backed";

type RenderProfileScenarioBase = Readonly<{
    name: RenderProfileScenarioName;
    itemCount: number;
    source: RenderProfileScenarioSource;
}>;

export type RenderProfileRendererOnlyScenario = RenderProfileScenarioBase &
    Readonly<{
        source: "renderer-only";
        input: RenderFrameInput;
    }>;

export type RenderProfileWorldBackedScenario = RenderProfileScenarioBase &
    Readonly<{
        source: "world-backed";
        world: WorldManagerService;
        storeIds: readonly string[];
        extract(): RenderFrameInput;
    }>;

export type RenderProfileScenario =
    | RenderProfileRendererOnlyScenario
    | RenderProfileWorldBackedScenario;

export type RenderProfileScenarioOptions = Readonly<{
    includeWorldBacked?: boolean;
}>;

type RenderProfileStaticScenarioName = Exclude<
    RenderProfileScenarioName,
    "world-rects-1k" | "world-rects-10k"
>;

type RenderProfileWorldScenarioName = Extract<
    RenderProfileScenarioName,
    "world-rects-1k" | "world-rects-10k"
>;

type WorldRectProfileScenario = Readonly<{
    name: RenderProfileWorldScenarioName;
    input: RenderFrameInput;
    itemCount: number;
}>;

export const RENDER_PROFILE_SCENARIO_NAMES: readonly RenderProfileScenarioName[] =
    [
        "rects-10k",
        "sprites-10k",
        "circles-5k",
        "lines-10k",
        "polygons-5k",
        "mixed-10k",
        "world-rects-1k",
        "world-rects-10k",
    ];

const TARGET = Object.freeze({ w: 1920, h: 1080, dpr: 1 });
const PROFILE_STORE_ID = "profile-main";

function colorAt(index: number) {
    return {
        r: ((index * 37) % 255) / 255,
        g: ((index * 67) % 255) / 255,
        b: ((index * 97) % 255) / 255,
    };
}

function xAt(index: number): number {
    return (index % 200) * 11 - 1000;
}

function yAt(index: number): number {
    return Math.floor(index / 200) * 13 - 650;
}

function createRect(index: number): RenderRect2D {
    return {
        kind: "rect",
        sortKey: index,
        x: xAt(index),
        y: yAt(index),
        prevX: xAt(index) - 0.5,
        prevY: yAt(index) - 0.25,
        w: 7 + (index % 5),
        h: 9 + (index % 7),
        color: colorAt(index),
        opacity: 0.65 + (index % 35) / 100,
    };
}

function createSprite(index: number): RenderSprite2D {
    return {
        kind: "sprite",
        sortKey: index,
        x: xAt(index),
        y: yAt(index),
        prevX: xAt(index) - 0.25,
        prevY: yAt(index) + 0.5,
        w: 16 + (index % 4),
        h: 16 + (index % 6),
        resourceId: `sprite.${index % 8}`,
        uv: {
            u: (index % 4) * 0.25,
            v: (Math.floor(index / 4) % 4) * 0.25,
            w: 0.25,
            h: 0.25,
        },
        tint: colorAt(index),
        opacity: 0.75 + (index % 25) / 100,
        blend: "alpha",
    };
}

function createCircle(index: number): RenderCircle2D {
    return {
        kind: "circle",
        sortKey: index,
        x: xAt(index),
        y: yAt(index),
        radius: 4 + (index % 9),
        color: colorAt(index),
        opacity: 0.7 + (index % 30) / 100,
    };
}

function createLine(index: number): RenderLine2D {
    const x = xAt(index);
    const y = yAt(index);

    return {
        kind: "line",
        sortKey: index,
        startX: x,
        startY: y,
        endX: x + 8 + (index % 17),
        endY: y + 3 + (index % 11),
        strokeWidth: 1 + (index % 4),
        color: colorAt(index),
        opacity: 0.8,
    };
}

function createPolygon(index: number): RenderPolygon2D {
    const sides = 5 + (index % 4);
    const radius = 5 + (index % 6);
    const vertices = Array.from({ length: sides }, (_, vertexIndex) => {
        const radians = (Math.PI * 2 * vertexIndex) / sides;
        return {
            x: Math.cos(radians) * radius,
            y: Math.sin(radians) * radius,
        };
    });

    return {
        kind: "polygon",
        sortKey: index,
        x: xAt(index),
        y: yAt(index),
        radians: (index % 360) * (Math.PI / 180),
        vertices,
        color: colorAt(index),
        opacity: 0.85,
    };
}

function createMixedItem(index: number): RenderItem2D {
    switch (index % 5) {
        case 0:
            return createRect(index);
        case 1:
            return createSprite(index);
        case 2:
            return createCircle(index);
        case 3:
            return createLine(index);
        default:
            return createPolygon(index);
    }
}

function createInput(items: readonly RenderItem2D[]): RenderFrameInput {
    return {
        target: TARGET,
        alpha: 0.5,
        layers: [
            {
                id: "profile-main",
                order: 0,
                items,
            },
        ],
    };
}

function createWorldRectEntity(index: number): Entity {
    return {
        id: `profile.rect.${index}`,
        position: {
            x: xAt(index),
            y: yAt(index),
        },
        prevPosition: {
            x: xAt(index) - 0.5,
            y: yAt(index) - 0.25,
        },
        size: {
            w: 7 + (index % 5),
            h: 9 + (index % 7),
        },
        color: colorAt(index),
    };
}

function createItems(
    itemCount: number,
    createItem: (index: number) => RenderItem2D,
): readonly RenderItem2D[] {
    return Array.from({ length: itemCount }, (_, index) => createItem(index));
}

export function createRenderProfileScenario(
    name: RenderProfileStaticScenarioName,
): RenderProfileRendererOnlyScenario {
    switch (name) {
        case "rects-10k": {
            const items = createItems(10_000, createRect);
            return {
                name,
                source: "renderer-only",
                itemCount: items.length,
                input: createInput(items),
            };
        }
        case "sprites-10k": {
            const items = createItems(10_000, createSprite);
            return {
                name,
                source: "renderer-only",
                itemCount: items.length,
                input: createInput(items),
            };
        }
        case "circles-5k": {
            const items = createItems(5_000, createCircle);
            return {
                name,
                source: "renderer-only",
                itemCount: items.length,
                input: createInput(items),
            };
        }
        case "lines-10k": {
            const items = createItems(10_000, createLine);
            return {
                name,
                source: "renderer-only",
                itemCount: items.length,
                input: createInput(items),
            };
        }
        case "polygons-5k": {
            const items = createItems(5_000, createPolygon);
            return {
                name,
                source: "renderer-only",
                itemCount: items.length,
                input: createInput(items),
            };
        }
        case "mixed-10k": {
            const items = createItems(10_000, createMixedItem);
            return {
                name,
                source: "renderer-only",
                itemCount: items.length,
                input: createInput(items),
            };
        }
    }
}

async function createWorldRectScenario(
    scenario: WorldRectProfileScenario,
): Promise<RenderProfileWorldBackedScenario> {
    const world = createWorldManager();
    await world.start();

    for (let i = 0; i < scenario.itemCount; i++) {
        world.commands.request.spawn(PROFILE_STORE_ID, createWorldRectEntity(i));
    }

    world.flush();
    world.publish();

    const extractionInput: RenderExtractionInput = {
        alpha: scenario.input.alpha,
        target: scenario.input.target,
        storeIds: [PROFILE_STORE_ID],
        world,
    };

    return {
        name: scenario.name,
        source: "world-backed",
        itemCount: scenario.itemCount,
        world,
        storeIds: [PROFILE_STORE_ID],
        extract: () => extractRenderFrameInput(extractionInput),
    };
}

export async function createWorldBackedRenderProfileScenario(
    name: RenderProfileWorldScenarioName,
): Promise<RenderProfileWorldBackedScenario> {
    switch (name) {
        case "world-rects-1k": {
            return createWorldRectScenario({
                name,
                itemCount: 1_000,
                input: createInput([]),
            });
        }
        case "world-rects-10k": {
            return createWorldRectScenario({
                name,
                itemCount: 10_000,
                input: createInput([]),
            });
        }
    }
}

export async function createRenderProfileScenarios(
    options: RenderProfileScenarioOptions = {},
): Promise<readonly RenderProfileScenario[]> {
    const rendererOnlyScenarios: RenderProfileScenario[] = [
        createRenderProfileScenario("rects-10k"),
        createRenderProfileScenario("sprites-10k"),
        createRenderProfileScenario("circles-5k"),
        createRenderProfileScenario("lines-10k"),
        createRenderProfileScenario("polygons-5k"),
        createRenderProfileScenario("mixed-10k"),
    ];

    if (options.includeWorldBacked === false) {
        return rendererOnlyScenarios;
    }

    return [
        ...rendererOnlyScenarios,
        await createWorldBackedRenderProfileScenario("world-rects-1k"),
        await createWorldBackedRenderProfileScenario("world-rects-10k"),
    ];
}
