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
    | "mixed-10k";

export type RenderProfileScenario = Readonly<{
    name: RenderProfileScenarioName;
    itemCount: number;
    input: RenderFrameInput;
}>;

export const RENDER_PROFILE_SCENARIO_NAMES: readonly RenderProfileScenarioName[] =
    [
        "rects-10k",
        "sprites-10k",
        "circles-5k",
        "lines-10k",
        "polygons-5k",
        "mixed-10k",
    ];

const TARGET = Object.freeze({ w: 1920, h: 1080, dpr: 1 });

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

function createItems(
    itemCount: number,
    createItem: (index: number) => RenderItem2D,
): readonly RenderItem2D[] {
    return Array.from({ length: itemCount }, (_, index) => createItem(index));
}

export function createRenderProfileScenario(
    name: RenderProfileScenarioName,
): RenderProfileScenario {
    switch (name) {
        case "rects-10k": {
            const items = createItems(10_000, createRect);
            return { name, itemCount: items.length, input: createInput(items) };
        }
        case "sprites-10k": {
            const items = createItems(10_000, createSprite);
            return { name, itemCount: items.length, input: createInput(items) };
        }
        case "circles-5k": {
            const items = createItems(5_000, createCircle);
            return { name, itemCount: items.length, input: createInput(items) };
        }
        case "lines-10k": {
            const items = createItems(10_000, createLine);
            return { name, itemCount: items.length, input: createInput(items) };
        }
        case "polygons-5k": {
            const items = createItems(5_000, createPolygon);
            return { name, itemCount: items.length, input: createInput(items) };
        }
        case "mixed-10k": {
            const items = createItems(10_000, createMixedItem);
            return { name, itemCount: items.length, input: createInput(items) };
        }
    }
}

export function createRenderProfileScenarios(): readonly RenderProfileScenario[] {
    return RENDER_PROFILE_SCENARIO_NAMES.map(createRenderProfileScenario);
}
