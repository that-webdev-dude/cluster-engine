import type {
    RenderColorInput,
    RenderFrameInput,
    RenderItem2D,
    RenderLayerInput,
    RenderRect2D,
    RenderTargetInfo,
} from "../../services/render";

/** Minimal current-world field reader used by the temporary render adapter. */
export type RenderExtractionQueryField = Readonly<{
    read(): unknown;
}>;

/** Minimal current-world query row shape consumed inside game extraction. */
export type RenderExtractionQueryRow = Readonly<{
    entityId: string;
    components: Readonly<
        Record<string, Readonly<Record<string, RenderExtractionQueryField>>>
    >;
}>;

/** Narrow structural reader for extracting renderer-domain input from world. */
export type RenderExtractionWorldReader = Readonly<{
    query(
        storeId: string,
        componentNames: readonly string[],
    ): readonly RenderExtractionQueryRow[];
}>;

/** Inputs needed to build a renderer-domain frame from active game stores. */
export type RenderExtractionInput = Readonly<{
    alpha: number;
    target: RenderTargetInfo;
    storeIds: readonly string[];
    world: RenderExtractionWorldReader;
    debug?: boolean;
}>;

export type RenderExtractionAdapter = Readonly<{
    extract(input: RenderExtractionInput): RenderFrameInput;
}>;

type Point2D = Readonly<{
    x: number;
    y: number;
}>;

type Size2D = Readonly<{
    w: number;
    h: number;
}>;

type OptionalRenderData = Readonly<{
    prevPositionByEntityId: ReadonlyMap<string, Point2D>;
    colorByEntityId: ReadonlyMap<string, RenderColorInput>;
}>;

type MutableRenderRect2D = {
    -readonly [Key in keyof RenderRect2D]: RenderRect2D[Key];
};

type MutableRenderLayerInput = {
    id: RenderLayerInput["id"];
    order: number;
    items: RenderItem2D[];
};

type MutableRenderFrameInput = {
    target: RenderFrameInput["target"];
    alpha: number;
    layers: MutableRenderLayerInput[];
};

const RECT_COMPONENTS = ["position", "size"] as const;
const PREV_POSITION_COMPONENTS = ["prevPosition"] as const;
const COLOR_COMPONENTS = ["color"] as const;

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function readField(
    row: RenderExtractionQueryRow,
    componentName: string,
    fieldName: string,
): unknown {
    return row.components[componentName]?.[fieldName]?.read();
}

function readRequiredNumber(
    row: RenderExtractionQueryRow,
    componentName: string,
    fieldName: string,
    debug: boolean,
): number | undefined {
    const value = readField(row, componentName, fieldName);
    if (isFiniteNumber(value)) return value;

    if (debug) {
        throw new Error(
            `RenderExtraction.extract: ${componentName}.${fieldName} must be a finite number`,
        );
    }

    return undefined;
}

function readOptionalNumber(
    row: RenderExtractionQueryRow,
    componentName: string,
    fieldName: string,
    debug: boolean,
): number | undefined {
    const value = readField(row, componentName, fieldName);
    if (value === undefined) return undefined;
    if (isFiniteNumber(value)) return value;

    if (debug) {
        throw new Error(
            `RenderExtraction.extract: ${componentName}.${fieldName} must be a finite number`,
        );
    }

    return undefined;
}

function readRequiredPoint(
    row: RenderExtractionQueryRow,
    componentName: string,
    debug: boolean,
): Point2D | undefined {
    const x = readRequiredNumber(row, componentName, "x", debug);
    const y = readRequiredNumber(row, componentName, "y", debug);
    if (x === undefined || y === undefined) return undefined;

    return { x, y };
}

function readOptionalPoint(
    row: RenderExtractionQueryRow,
    componentName: string,
    debug: boolean,
): Point2D | undefined {
    const x = readOptionalNumber(row, componentName, "x", debug);
    const y = readOptionalNumber(row, componentName, "y", debug);
    if (x === undefined || y === undefined) return undefined;

    return { x, y };
}

function readRequiredSize(
    row: RenderExtractionQueryRow,
    debug: boolean,
): Size2D | undefined {
    const w = readRequiredNumber(row, "size", "w", debug);
    const h = readRequiredNumber(row, "size", "h", debug);
    if (w === undefined || h === undefined) return undefined;

    if (w > 0 && h > 0) {
        return { w, h };
    }

    if (debug) {
        throw new Error(
            "RenderExtraction.extract: size.w and size.h must be greater than 0",
        );
    }

    return undefined;
}

function readOptionalColor(
    row: RenderExtractionQueryRow,
    debug: boolean,
): RenderColorInput | undefined {
    const r = readOptionalNumber(row, "color", "r", debug);
    const g = readOptionalNumber(row, "color", "g", debug);
    const b = readOptionalNumber(row, "color", "b", debug);
    if (r === undefined || g === undefined || b === undefined) {
        return undefined;
    }

    return { r, g, b };
}

function readOptionalRenderData(
    world: RenderExtractionWorldReader,
    storeId: string,
    debug: boolean,
): OptionalRenderData {
    const prevPositionByEntityId = new Map<string, Point2D>();
    const colorByEntityId = new Map<string, RenderColorInput>();

    for (const row of world.query(storeId, PREV_POSITION_COMPONENTS)) {
        const prevPosition = readOptionalPoint(row, "prevPosition", debug);
        if (prevPosition) {
            prevPositionByEntityId.set(row.entityId, prevPosition);
        }
    }

    for (const row of world.query(storeId, COLOR_COMPONENTS)) {
        const color = readOptionalColor(row, debug);
        if (color) {
            colorByEntityId.set(row.entityId, color);
        }
    }

    return {
        prevPositionByEntityId,
        colorByEntityId,
    };
}

function writeRectItem(
    target: MutableRenderRect2D,
    args: Readonly<{
        sortKey: number;
        position: Point2D;
        prevPosition: Point2D;
        size: Size2D;
        color?: RenderColorInput;
    }>,
): RenderRect2D {
    target.kind = "rect";
    target.sortKey = args.sortKey;
    target.x = args.position.x;
    target.y = args.position.y;
    target.prevX = args.prevPosition.x;
    target.prevY = args.prevPosition.y;
    target.w = args.size.w;
    target.h = args.size.h;
    target.color = args.color;

    return target;
}

function createRectItemSlot(): MutableRenderRect2D {
    return {
        kind: "rect",
        sortKey: 0,
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        w: 0,
        h: 0,
        color: undefined,
    };
}

function writeStoreLayer(
    target: MutableRenderLayerInput,
    args: Readonly<{
        world: RenderExtractionWorldReader;
        storeId: string;
        layerIndex: number;
        debug: boolean;
    }>,
): RenderLayerInput {
    const optionalData = readOptionalRenderData(
        args.world,
        args.storeId,
        args.debug,
    );
    const rows = args.world.query(args.storeId, RECT_COMPONENTS);
    target.id = `game.layer.${args.layerIndex}`;
    target.order = args.layerIndex;

    let itemCount = 0;
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const position = readRequiredPoint(row, "position", args.debug);
        const size = readRequiredSize(row, args.debug);
        if (!position || !size) continue;

        const prevPosition =
            optionalData.prevPositionByEntityId.get(row.entityId) ?? position;
        const item =
            (target.items[itemCount] as MutableRenderRect2D | undefined) ??
            createRectItemSlot();

        target.items[itemCount] = writeRectItem(item, {
            sortKey: rowIndex,
            position,
            prevPosition,
            size,
            color: optionalData.colorByEntityId.get(row.entityId),
        });
        itemCount++;
    }

    target.items.length = itemCount;

    return target;
}

function createLayerSlot(): MutableRenderLayerInput {
    return {
        id: "",
        order: 0,
        items: [],
    };
}

/** Converts current game/world rows into sealed renderer-domain frame input. */
export function extractRenderFrameInput(
    input: RenderExtractionInput,
): RenderFrameInput {
    return createRenderExtractionAdapter().extract(input);
}

export function createRenderExtractionAdapter(): RenderExtractionAdapter {
    const frame: MutableRenderFrameInput = {
        target: { w: 0, h: 0, dpr: 1 },
        alpha: 0,
        layers: [],
    };

    function extract(input: RenderExtractionInput): RenderFrameInput {
        const debug = input.debug ?? false;

        frame.target = input.target;
        frame.alpha = input.alpha;

        for (let i = 0; i < input.storeIds.length; i++) {
            const layer = frame.layers[i] ?? createLayerSlot();
            frame.layers[i] = writeStoreLayer(layer, {
                world: input.world,
                storeId: input.storeIds[i],
                layerIndex: i,
                debug,
            }) as MutableRenderLayerInput;
        }

        frame.layers.length = input.storeIds.length;

        return frame;
    }

    return Object.freeze({ extract });
}
