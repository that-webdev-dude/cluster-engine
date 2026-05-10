import type {
    RenderColorInput,
    RenderFrameInput,
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

function extractStoreItems(
    world: RenderExtractionWorldReader,
    storeId: string,
    debug: boolean,
): readonly RenderRect2D[] {
    const optionalData = readOptionalRenderData(world, storeId, debug);
    const rows = world.query(storeId, RECT_COMPONENTS);
    const items: RenderRect2D[] = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const position = readRequiredPoint(row, "position", debug);
        const size = readRequiredSize(row, debug);
        if (!position || !size) continue;

        const prevPosition =
            optionalData.prevPositionByEntityId.get(row.entityId) ?? position;
        const color = optionalData.colorByEntityId.get(row.entityId);

        items.push({
            kind: "rect",
            sortKey: i,
            x: position.x,
            y: position.y,
            prevX: prevPosition.x,
            prevY: prevPosition.y,
            w: size.w,
            h: size.h,
            color,
        });
    }

    return items;
}

/** Converts current game/world rows into sealed renderer-domain frame input. */
export function extractRenderFrameInput(
    input: RenderExtractionInput,
): RenderFrameInput {
    const debug = input.debug ?? false;

    return {
        target: input.target,
        alpha: input.alpha,
        layers: input.storeIds.map((storeId, index) => ({
            id: `game.layer.${index}`,
            order: index,
            items: extractStoreItems(input.world, storeId, debug),
        })),
    };
}
