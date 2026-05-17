import { resolveRenderTransform2D } from "./Interpolation.module";
import type { RenderResolvedTransform2D } from "./Interpolation.module";
import { createRender2DHandoffAdapter } from "./Render2DHandoff.module";
import type {
    Render2DHandoffBatch,
    Render2DHandoffColor,
    Render2DHandoffCommand,
    Render2DHandoffFrame,
    Render2DHandoffGeometry,
    Render2DHandoffGlyphQuad2D,
    Render2DHandoffPipelineFamily,
    Render2DHandoffSourceKind,
    Render2DHandoffVertexLayout,
} from "./Render2DHandoff.module";
import { createTextLayout } from "./TextLayout.module";
import type { FontRegistry } from "./FontRegistry.module";
import type { TextLayoutModule } from "./TextLayout.module";
import type {
    RenderBlendMode,
    RenderColorInput,
    RenderFrameInput,
    RenderFrameStats,
    RenderItem2D,
    RenderLayerId,
    RenderPoint2DInput,
    RenderResourceId,
    RenderTransform2DInput,
    RenderText2D,
    RenderUvRectInput,
} from "../service/Render.types";

type Render2DPipelineFamily = Render2DHandoffPipelineFamily;

type Render2DVertexLayout = Render2DHandoffVertexLayout;

type Render2DPreparedSourceKind = Render2DHandoffSourceKind;

export type PreparedGlyphQuad2D = Render2DHandoffGlyphQuad2D;

export type Render2DPreparedGeometry = Render2DHandoffGeometry;

export type Render2DPreparedItem = Render2DHandoffCommand;

export type Render2DPreparedBatch = Render2DHandoffBatch;

export type Render2DPreparedFrame = Render2DHandoffFrame;

export type Render2DPrepareConfig = Readonly<{
    debug?: boolean;
    fontRegistry?: Pick<FontRegistry, "get">;
    textLayout?: TextLayoutModule;
}>;

export type Render2DPrepareModule = Readonly<{
    prepare(input: RenderFrameInput): Render2DPreparedFrame;
}>;

type IndexedRenderLayer = Readonly<{
    layerId: RenderLayerId;
    layerOrder: number;
    sourceLayerIndex: number;
    items: readonly RenderItem2D[];
}>;

type IndexedRenderItem = Readonly<{
    sourceIndex: number;
    item: RenderItem2D;
}>;

type MutableLayerRecord = {
    layerId: RenderLayerId;
    layerOrder: number;
    sourceLayerIndex: number;
    items: readonly RenderItem2D[];
};

type MutableItemSortRecord = {
    sourceIndex: number;
    item: RenderItem2D;
};

type MutablePreparedItem = {
    layerId: RenderLayerId;
    layerOrder: number;
    sourceIndex: number;
    sortKey: number;
    sourceKind: Render2DPreparedSourceKind;
    kind: Render2DPreparedGeometry["kind"];
    pipelineFamily: Render2DPipelineFamily;
    vertexLayout: Render2DVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    vertexCount: number;
    x?: number;
    y?: number;
    transform?: RenderResolvedTransform2D;
    instanceTransform?: RenderTransform2DInput;
    color: RenderPreparedColor;
    geometry: Render2DPreparedGeometry;
};

export type RenderPreparedColor = Render2DHandoffColor;

type MutablePreparedColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

type MutableRectQuadGeometry = {
    kind: "rect-quad";
    w: number;
    h: number;
    uv?: RenderUvRectInput;
};

type MutableCircleLikeGeometry = {
    kind: "circle-like";
    radiusX: number;
    radiusY: number;
    segments: number;
};

type MutableLineGeometry = {
    kind: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    strokeWidth: number;
};

type MutablePolygonGeometry = {
    kind: "polygon";
    vertices: readonly RenderPoint2DInput[];
    localGeometryKey: string;
};

type MutableGlyphQuadGeometry = {
    kind: "glyph-quad";
    sourceKind: "text";
    sourceIndex: number;
    glyphIndex: number;
    resourceId: RenderResourceId;
    x: number;
    y: number;
    w: number;
    h: number;
    uv: Extract<Render2DPreparedGeometry, { kind: "glyph-quad" }>["uv"];
};

type MutablePreparedBatch = {
    layerId: RenderLayerId;
    pipelineFamily: Render2DPipelineFamily;
    vertexLayout: Render2DVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    containsText: boolean;
    itemStart: number;
    itemCount: number;
    vertexCount: number;
};

type MutableTextStats = {
    textItemCount: number;
    preparedGlyphCount: number;
    glyphVertexCount: number;
    missingFontCount: number;
    missingGlyphCount: number;
};

type MutableRenderFrameStats = {
    -readonly [Key in keyof RenderFrameStats]: RenderFrameStats[Key];
};

type MutablePreparedFrame = {
    target: RenderFrameInput["target"];
    alpha: number;
    camera?: RenderFrameInput["camera"];
    items: MutablePreparedItem[];
    itemCount: number;
    batches: MutablePreparedBatch[];
    batchCount: number;
    stats: MutableRenderFrameStats;
};

const DEFAULT_CIRCLE_SEGMENTS = 24;
const DEFAULT_ELLIPSE_SEGMENTS = 24;
const MAX_POLYGON_VERTICES = 64;
const GLYPH_QUAD_VERTEX_COUNT = 6;

function createEmptyStats(): RenderFrameStats {
    return {
        passCount: 0,
        commandCount: 0,
        batchCount: 0,
        drawCallCount: 0,
        vertexCount: 0,
        uploadCallCount: 0,
        uploadByteCount: 0,
        uploadRangeCount: 0,
        uploadLayoutCount: 0,
        frameVertexBufferCreateCount: 0,
        frameVertexBufferGrowCount: 0,
        frameVertexBufferReuseCount: 0,
        frameVertexBufferCapacityBytes: 0,
        skippedResourceCount: 0,
        fallbackResourceCount: 0,
        textureResourceCount: 0,
        fontResourceCount: 0,
        fontPageResourceCount: 0,
        fontReplacementRegistrationCount: 0,
        invalidFontRegistrationCount: 0,
        missingFontCount: 0,
        missingGlyphCount: 0,
        textItemCount: 0,
        preparedGlyphCount: 0,
        glyphVertexCount: 0,
        textBatchCount: 0,
    };
}

function compareLayers(a: IndexedRenderLayer, b: IndexedRenderLayer): number {
    if (a.layerOrder !== b.layerOrder) {
        return a.layerOrder - b.layerOrder;
    }

    return a.sourceLayerIndex - b.sourceLayerIndex;
}

function compareItems(a: IndexedRenderItem, b: IndexedRenderItem): number {
    if (a.item.sortKey !== b.item.sortKey) {
        return a.item.sortKey - b.item.sortKey;
    }

    return a.sourceIndex - b.sourceIndex;
}

function getPipelineFamily(item: RenderItem2D): Render2DPipelineFamily {
    return item.kind === "sprite" || item.kind === "text"
        ? "textured-2d"
        : "solid-2d";
}

function getVertexLayout(item: RenderItem2D): Render2DVertexLayout {
    return item.kind === "sprite" || item.kind === "text"
        ? "position-uv-tint-2d"
        : "position-color-2d";
}

function getBlendMode(item: RenderItem2D): RenderBlendMode {
    return item.blend ?? (item.kind === "text" ? "alpha" : "opaque");
}

function getItemVertexCount(item: RenderItem2D): number {
    switch (item.kind) {
        case "rect":
        case "sprite":
            return item.w > 0 && item.h > 0 ? 6 : 0;
        case "circle":
            return item.radius > 0 ? DEFAULT_CIRCLE_SEGMENTS * 3 : 0;
        case "ellipse":
            return item.radiusX > 0 && item.radiusY > 0
                ? DEFAULT_ELLIPSE_SEGMENTS * 3
                : 0;
        case "line": {
            const strokeWidth = item.strokeWidth ?? 1;
            const dx = item.endX - item.startX;
            const dy = item.endY - item.startY;

            return (dx !== 0 || dy !== 0) && strokeWidth > 0 ? 6 : 0;
        }
        case "polygon":
            return item.vertices.length >= 3 &&
                item.vertices.length <= MAX_POLYGON_VERTICES
                ? (item.vertices.length - 2) * 3
                : 0;
        case "text":
            return 0;
    }
}

function getPolygonLocalGeometryKey(
    vertices: readonly RenderPoint2DInput[],
): string {
    return vertices.map((vertex) => `${vertex.x},${vertex.y}`).join("|");
}

function getPreparedPosition(
    item: RenderItem2D,
    alpha: number,
): RenderResolvedTransform2D | undefined {
    if (item.kind === "line") {
        return undefined;
    }

    return resolveRenderTransform2D(item, alpha);
}

function getColorValue(
    color: RenderColorInput | undefined,
    channel: keyof RenderColorInput,
): number {
    return color?.[channel] ?? 1;
}

function writePreparedColor(
    target: MutablePreparedColor,
    item: RenderItem2D,
): RenderPreparedColor {
    const color =
        item.kind === "sprite" || item.kind === "text"
            ? item.tint ?? item.color
            : item.color;

    target.r = getColorValue(color, "r");
    target.g = getColorValue(color, "g");
    target.b = getColorValue(color, "b");
    target.a = item.opacity ?? 1;

    return target;
}

function writePrimitiveGeometry(
    geometries: MutableGeometrySlot,
    item: Exclude<RenderItem2D, RenderText2D>,
): Render2DPreparedGeometry {
    switch (item.kind) {
        case "rect":
            geometries.rect.w = item.w;
            geometries.rect.h = item.h;
            geometries.rect.uv = undefined;
            return geometries.rect;
        case "sprite":
            geometries.rect.w = item.w;
            geometries.rect.h = item.h;
            geometries.rect.uv = item.uv;
            return geometries.rect;
        case "circle":
            geometries.circle.radiusX = item.radius;
            geometries.circle.radiusY = item.radius;
            geometries.circle.segments = DEFAULT_CIRCLE_SEGMENTS;
            return geometries.circle;
        case "ellipse":
            geometries.circle.radiusX = item.radiusX;
            geometries.circle.radiusY = item.radiusY;
            geometries.circle.segments = DEFAULT_ELLIPSE_SEGMENTS;
            return geometries.circle;
        case "line":
            geometries.line.startX = item.startX;
            geometries.line.startY = item.startY;
            geometries.line.endX = item.endX;
            geometries.line.endY = item.endY;
            geometries.line.strokeWidth = item.strokeWidth ?? 1;
            return geometries.line;
        case "polygon":
            geometries.polygon.vertices = item.vertices;
            geometries.polygon.localGeometryKey = getPolygonLocalGeometryKey(
                item.vertices,
            );
            return geometries.polygon;
    }
}

type MutableGeometrySlot = {
    rect: MutableRectQuadGeometry;
    circle: MutableCircleLikeGeometry;
    line: MutableLineGeometry;
    polygon: MutablePolygonGeometry;
    glyph: MutableGlyphQuadGeometry;
};

function assertValidAlpha(input: RenderFrameInput, debug: boolean): void {
    if (!debug) return;
    if (Number.isFinite(input.alpha) && input.alpha >= 0 && input.alpha <= 1) {
        return;
    }

    throw new Error(
        "Render2DPrepare.prepare: alpha must be a finite number between 0 and 1",
    );
}

export function createRender2DPrepare(
    config: Render2DPrepareConfig = {},
): Render2DPrepareModule {
    const debug = config.debug ?? false;
    const fontRegistry = config.fontRegistry;
    const textLayout = config.textLayout ?? createTextLayout();
    const handoffAdapter = createRender2DHandoffAdapter();
    const layerRecords: MutableLayerRecord[] = [];
    const itemSortRecords: MutableItemSortRecord[] = [];
    const preparedItems: MutablePreparedItem[] = [];
    const preparedBatches: MutablePreparedBatch[] = [];
    const preparedColors: MutablePreparedColor[] = [];
    const preparedGeometries: MutableGeometrySlot[] = [];
    const textStats: MutableTextStats = {
        textItemCount: 0,
        preparedGlyphCount: 0,
        glyphVertexCount: 0,
        missingFontCount: 0,
        missingGlyphCount: 0,
    };
    const preparedStats = createEmptyStats() as MutableRenderFrameStats;
    const preparedFrame: MutablePreparedFrame = {
        target: { w: 0, h: 0, dpr: 1 },
        alpha: 0,
        items: preparedItems,
        itemCount: 0,
        batches: preparedBatches,
        batchCount: 0,
        stats: preparedStats,
    };
    let layerRecordCount = 0;
    let itemSortRecordCount = 0;
    let preparedItemCount = 0;
    let preparedBatchCount = 0;

    function resetFrameArenas(): void {
        layerRecordCount = 0;
        itemSortRecordCount = 0;
        preparedItemCount = 0;
        preparedBatchCount = 0;
        textStats.textItemCount = 0;
        textStats.preparedGlyphCount = 0;
        textStats.glyphVertexCount = 0;
        textStats.missingFontCount = 0;
        textStats.missingGlyphCount = 0;
    }

    function writeLayerRecord(
        index: number,
        input: RenderFrameInput,
    ): MutableLayerRecord {
        const layer = input.layers[index];
        const record =
            layerRecords[index] ??
            (layerRecords[index] = {
                layerId: layer.id,
                layerOrder: layer.order,
                sourceLayerIndex: index,
                items: layer.items,
            });

        record.layerId = layer.id;
        record.layerOrder = layer.order;
        record.sourceLayerIndex = index;
        record.items = layer.items;
        layerRecordCount = Math.max(layerRecordCount, index + 1);

        return record;
    }

    function getPreparedColorSlot(index: number): MutablePreparedColor {
        return (
            preparedColors[index] ??
            (preparedColors[index] = { r: 1, g: 1, b: 1, a: 1 })
        );
    }

    function getPreparedGeometrySlot(index: number): MutableGeometrySlot {
        return (
            preparedGeometries[index] ??
            (preparedGeometries[index] = {
                rect: { kind: "rect-quad", w: 0, h: 0 },
                circle: {
                    kind: "circle-like",
                    radiusX: 0,
                    radiusY: 0,
                    segments: DEFAULT_CIRCLE_SEGMENTS,
                },
                line: {
                    kind: "line",
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    endY: 0,
                    strokeWidth: 1,
                },
                polygon: {
                    kind: "polygon",
                    vertices: [],
                    localGeometryKey: "",
                },
                glyph: {
                    kind: "glyph-quad",
                    sourceKind: "text",
                    sourceIndex: 0,
                    glyphIndex: 0,
                    resourceId: "",
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0,
                    uv: { u: 0, v: 0, w: 1, h: 1 },
                },
            })
        );
    }

    function writeItemSortRecord(
        index: number,
        item: RenderItem2D,
    ): MutableItemSortRecord {
        const record =
            itemSortRecords[index] ??
            (itemSortRecords[index] = {
                sourceIndex: index,
                item,
            });

        record.sourceIndex = index;
        record.item = item;
        itemSortRecordCount = Math.max(itemSortRecordCount, index + 1);

        return record;
    }

    function appendPreparedGeometry(args: {
        layer: IndexedRenderLayer;
        sourceIndex: number;
        sourceKind: Render2DPreparedSourceKind;
        sortKey: number;
        pipelineFamily: Render2DPipelineFamily;
        vertexLayout: Render2DVertexLayout;
        blendMode: RenderBlendMode;
        resourceId?: RenderResourceId;
        vertexCount: number;
        transform?: RenderResolvedTransform2D;
        instanceTransform?: RenderTransform2DInput;
        color: RenderPreparedColor;
        geometry: Render2DPreparedGeometry;
    }): void {
        const index = preparedItemCount;
        const record =
            preparedItems[index] ??
            (preparedItems[index] = {
                layerId: args.layer.layerId,
                layerOrder: args.layer.layerOrder,
                sourceIndex: args.sourceIndex,
                sortKey: args.sortKey,
                sourceKind: args.sourceKind,
                kind: args.geometry.kind,
                pipelineFamily: args.pipelineFamily,
                vertexLayout: args.vertexLayout,
                blendMode: args.blendMode,
                resourceId: args.resourceId,
                vertexCount: args.vertexCount,
                color: args.color,
                geometry: args.geometry,
            });

        record.layerId = args.layer.layerId;
        record.layerOrder = args.layer.layerOrder;
        record.sourceIndex = args.sourceIndex;
        record.sortKey = args.sortKey;
        record.sourceKind = args.sourceKind;
        record.kind = args.geometry.kind;
        record.pipelineFamily = args.pipelineFamily;
        record.vertexLayout = args.vertexLayout;
        record.blendMode = args.blendMode;
        record.resourceId = args.resourceId;
        record.vertexCount = args.vertexCount;
        record.x = args.transform?.x;
        record.y = args.transform?.y;
        record.transform = args.transform;
        record.instanceTransform = args.instanceTransform;
        record.color = args.color;
        record.geometry = args.geometry;
        preparedItemCount++;
    }

    function appendPrimitivePreparedItem(
        layer: IndexedRenderLayer,
        sourceIndex: number,
        item: Exclude<RenderItem2D, RenderText2D>,
        vertexCount: number,
        alpha: number,
    ): void {
        const index = preparedItemCount;
        const color = writePreparedColor(getPreparedColorSlot(index), item);
        const geometry = writePrimitiveGeometry(
            getPreparedGeometrySlot(index),
            item,
        );

        appendPreparedGeometry({
            layer,
            sourceIndex,
            sourceKind: item.kind,
            sortKey: item.sortKey,
            pipelineFamily: getPipelineFamily(item),
            vertexLayout: getVertexLayout(item),
            blendMode: getBlendMode(item),
            resourceId: item.resourceId,
            vertexCount,
            transform:
                item.kind === "rect" ||
                item.kind === "sprite" ||
                item.kind === "circle" ||
                item.kind === "ellipse" ||
                item.kind === "polygon"
                    ? undefined
                    : getPreparedPosition(item, alpha),
            instanceTransform:
                item.kind === "rect" ||
                item.kind === "sprite" ||
                item.kind === "circle" ||
                item.kind === "ellipse" ||
                item.kind === "polygon"
                    ? item
                    : undefined,
            color,
            geometry,
        });
    }

    function appendTextPreparedItems(
        layer: IndexedRenderLayer,
        sourceIndex: number,
        item: RenderText2D,
    ): void {
        textStats.textItemCount++;
        const font = fontRegistry?.get(item.fontId);
        const result = textLayout.layout(item, font);
        textStats.missingFontCount += result.missingFontCount;
        textStats.missingGlyphCount += result.missingGlyphCount;
        if (result.glyphs.length === 0) return;

        const blendMode = getBlendMode(item);

        for (let glyphIndex = 0; glyphIndex < result.glyphs.length; glyphIndex++) {
            const glyph = result.glyphs[glyphIndex];
            if (glyph.w <= 0 || glyph.h <= 0) continue;

            const index = preparedItemCount;
            const color = writePreparedColor(getPreparedColorSlot(index), item);
            const geometry = getPreparedGeometrySlot(index).glyph;
            geometry.sourceIndex = sourceIndex;
            geometry.glyphIndex = glyphIndex;
            geometry.resourceId = glyph.resourceId;
            geometry.x = glyph.x;
            geometry.y = glyph.y;
            geometry.w = glyph.w;
            geometry.h = glyph.h;
            geometry.uv = glyph.uv;

            appendPreparedGeometry({
                layer,
                sourceIndex,
                sourceKind: "text",
                sortKey: item.sortKey,
                pipelineFamily: "textured-2d",
                vertexLayout: "position-uv-tint-2d",
                blendMode,
                resourceId: glyph.resourceId,
                vertexCount: GLYPH_QUAD_VERTEX_COUNT,
                transform: undefined,
                instanceTransform: item,
                color,
                geometry,
            });
            textStats.preparedGlyphCount++;
            textStats.glyphVertexCount += GLYPH_QUAD_VERTEX_COUNT;
        }
    }

    function areBatchCompatible(
        batchStartItem: MutablePreparedItem,
        item: MutablePreparedItem,
    ): boolean {
        return (
            batchStartItem.layerId === item.layerId &&
            batchStartItem.pipelineFamily === item.pipelineFamily &&
            batchStartItem.vertexLayout === item.vertexLayout &&
            batchStartItem.blendMode === item.blendMode &&
            batchStartItem.resourceId === item.resourceId
        );
    }

    function batchContainsText(itemStart: number, itemCount: number): boolean {
        for (let i = 0; i < itemCount; i++) {
            if (preparedItems[itemStart + i].sourceKind === "text") return true;
        }
        return false;
    }

    function appendPreparedBatch(
        itemStart: number,
        itemCount: number,
        vertexCount: number,
    ): void {
        if (itemCount <= 0) return;

        const item = preparedItems[itemStart];
        const index = preparedBatchCount;
        const batch =
            preparedBatches[index] ??
            (preparedBatches[index] = {
                layerId: item.layerId,
                pipelineFamily: item.pipelineFamily,
                vertexLayout: item.vertexLayout,
                blendMode: item.blendMode,
                resourceId: item.resourceId,
                containsText: false,
                itemStart,
                itemCount,
                vertexCount,
            });

        batch.layerId = item.layerId;
        batch.pipelineFamily = item.pipelineFamily;
        batch.vertexLayout = item.vertexLayout;
        batch.blendMode = item.blendMode;
        batch.resourceId = item.resourceId;
        batch.containsText = batchContainsText(itemStart, itemCount);
        batch.itemStart = itemStart;
        batch.itemCount = itemCount;
        batch.vertexCount = vertexCount;
        preparedBatchCount++;
    }

    function buildBatches(): void {
        preparedBatchCount = 0;
        if (preparedItemCount === 0) return;

        let batchStart = 0;
        let batchVertexCount = preparedItems[0].vertexCount;

        for (let i = 1; i < preparedItemCount; i++) {
            const item = preparedItems[i];

            if (areBatchCompatible(preparedItems[batchStart], item)) {
                batchVertexCount += item.vertexCount;
                continue;
            }

            appendPreparedBatch(batchStart, i - batchStart, batchVertexCount);
            batchStart = i;
            batchVertexCount = item.vertexCount;
        }

        appendPreparedBatch(
            batchStart,
            preparedItemCount - batchStart,
            batchVertexCount,
        );
    }

    function writePreparedStats(args: {
        passCount: number;
        commandCount: number;
        batchCount: number;
        vertexCount: number;
        textBatchCount: number;
    }): RenderFrameStats {
        preparedStats.passCount = args.passCount;
        preparedStats.commandCount = args.commandCount;
        preparedStats.batchCount = args.batchCount;
        preparedStats.drawCallCount = 0;
        preparedStats.vertexCount = args.vertexCount;
        preparedStats.uploadCallCount = 0;
        preparedStats.uploadByteCount = 0;
        preparedStats.uploadRangeCount = 0;
        preparedStats.uploadLayoutCount = 0;
        preparedStats.frameVertexBufferCreateCount = 0;
        preparedStats.frameVertexBufferGrowCount = 0;
        preparedStats.frameVertexBufferReuseCount = 0;
        preparedStats.frameVertexBufferCapacityBytes = 0;
        preparedStats.skippedResourceCount = 0;
        preparedStats.fallbackResourceCount = 0;
        preparedStats.textureResourceCount = 0;
        preparedStats.fontResourceCount = 0;
        preparedStats.fontPageResourceCount = 0;
        preparedStats.fontReplacementRegistrationCount = 0;
        preparedStats.invalidFontRegistrationCount = 0;
        preparedStats.missingFontCount = textStats.missingFontCount;
        preparedStats.missingGlyphCount = textStats.missingGlyphCount;
        preparedStats.textItemCount = textStats.textItemCount;
        preparedStats.preparedGlyphCount = textStats.preparedGlyphCount;
        // Compatibility metric: glyphs submit as quad instances now,
        // but public stats still report logical triangle vertices.
        preparedStats.glyphVertexCount = textStats.glyphVertexCount;
        preparedStats.textBatchCount = args.textBatchCount;

        return preparedStats;
    }

    function sortLayerRecords(): void {
        for (let i = 1; i < layerRecordCount; i++) {
            const record = layerRecords[i];
            let j = i - 1;

            while (j >= 0 && compareLayers(layerRecords[j], record) > 0) {
                layerRecords[j + 1] = layerRecords[j];
                j--;
            }

            layerRecords[j + 1] = record;
        }
    }

    function sortItemRecords(): void {
        for (let i = 1; i < itemSortRecordCount; i++) {
            const record = itemSortRecords[i];
            let j = i - 1;

            while (j >= 0 && compareItems(itemSortRecords[j], record) > 0) {
                itemSortRecords[j + 1] = itemSortRecords[j];
                j--;
            }

            itemSortRecords[j + 1] = record;
        }
    }

    return Object.freeze({
        prepare(input: RenderFrameInput): Render2DPreparedFrame {
            assertValidAlpha(input, debug);
            resetFrameArenas();

            for (let i = 0; i < input.layers.length; i++) {
                writeLayerRecord(i, input);
            }
            sortLayerRecords();

            for (
                let layerIndex = 0;
                layerIndex < layerRecordCount;
                layerIndex++
            ) {
                const layer = layerRecords[layerIndex];
                itemSortRecordCount = 0;
                for (let i = 0; i < layer.items.length; i++) {
                    writeItemSortRecord(i, layer.items[i]);
                }
                sortItemRecords();

                for (
                    let itemIndex = 0;
                    itemIndex < itemSortRecordCount;
                    itemIndex++
                ) {
                    const indexedItem = itemSortRecords[itemIndex];
                    if (indexedItem.item.kind === "text") {
                        appendTextPreparedItems(
                            layer,
                            indexedItem.sourceIndex,
                            indexedItem.item,
                        );
                        continue;
                    }

                    const vertexCount = getItemVertexCount(indexedItem.item);

                    if (vertexCount === 0) {
                        continue;
                    }

                    appendPrimitivePreparedItem(
                        layer,
                        indexedItem.sourceIndex,
                        indexedItem.item,
                        vertexCount,
                        input.alpha,
                    );
                }
            }

            buildBatches();

            let vertexCount = 0;
            let textBatchCount = 0;
            for (let i = 0; i < preparedItemCount; i++) {
                vertexCount += preparedItems[i].vertexCount;
            }
            for (let i = 0; i < preparedBatchCount; i++) {
                if (preparedBatches[i].containsText) textBatchCount++;
            }

            const stats = writePreparedStats({
                passCount: layerRecordCount,
                commandCount: preparedItemCount,
                batchCount: preparedBatchCount,
                vertexCount,
                textBatchCount,
            });

            preparedFrame.target = input.target;
            preparedFrame.alpha = input.alpha;
            preparedFrame.camera = input.camera;
            preparedFrame.itemCount = preparedItemCount;
            preparedFrame.batchCount = preparedBatchCount;
            preparedFrame.stats = stats;

            return handoffAdapter.fromPreparedFrame(
                preparedFrame as Render2DHandoffFrame,
            );
        },
    });
}
