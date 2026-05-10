import { resolveRenderTransform2D } from "./Interpolation.module";
import type {
    RenderBlendMode,
    RenderFrameInput,
    RenderFrameStats,
    RenderItem2D,
    RenderLayerId,
    RenderResourceId,
    RenderTargetInfo,
} from "../service/Render.types";

type Render2DPipelineFamily = "solid-2d" | "textured-2d";

type Render2DVertexLayout = "position-color-2d" | "position-uv-tint-2d";

export type Render2DPreparedItem = Readonly<{
    layerId: RenderLayerId;
    layerOrder: number;
    sourceIndex: number;
    sortKey: number;
    kind: RenderItem2D["kind"];
    pipelineFamily: Render2DPipelineFamily;
    vertexLayout: Render2DVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    vertexCount: number;
    x?: number;
    y?: number;
}>;

export type Render2DPreparedBatch = Readonly<{
    layerId: RenderLayerId;
    pipelineFamily: Render2DPipelineFamily;
    vertexLayout: Render2DVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    itemStart: number;
    itemCount: number;
    vertexCount: number;
}>;

export type Render2DPreparedFrame = Readonly<{
    target: RenderTargetInfo;
    items: readonly Render2DPreparedItem[];
    itemCount: number;
    batches: readonly Render2DPreparedBatch[];
    batchCount: number;
    stats: RenderFrameStats;
}>;

export type Render2DPrepareConfig = Readonly<{
    debug?: boolean;
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
    kind: RenderItem2D["kind"];
    pipelineFamily: Render2DPipelineFamily;
    vertexLayout: Render2DVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    vertexCount: number;
    x?: number;
    y?: number;
};

type MutablePreparedBatch = {
    layerId: RenderLayerId;
    pipelineFamily: Render2DPipelineFamily;
    vertexLayout: Render2DVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    itemStart: number;
    itemCount: number;
    vertexCount: number;
};

const DEFAULT_CIRCLE_SEGMENTS = 24;
const DEFAULT_ELLIPSE_SEGMENTS = 24;
const MAX_POLYGON_VERTICES = 64;

function createEmptyStats(): RenderFrameStats {
    return {
        passCount: 0,
        commandCount: 0,
        batchCount: 0,
        drawCallCount: 0,
        vertexCount: 0,
        skippedResourceCount: 0,
        fallbackResourceCount: 0,
        textureResourceCount: 0,
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
    return item.kind === "sprite" ? "textured-2d" : "solid-2d";
}

function getVertexLayout(item: RenderItem2D): Render2DVertexLayout {
    return item.kind === "sprite"
        ? "position-uv-tint-2d"
        : "position-color-2d";
}

function getBlendMode(item: RenderItem2D): RenderBlendMode {
    return item.blend ?? "opaque";
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
            const length = Math.hypot(
                item.endX - item.startX,
                item.endY - item.startY,
            );

            return length > 0 && strokeWidth > 0 ? 6 : 0;
        }
        case "polygon":
            return item.vertices.length >= 3 &&
                item.vertices.length <= MAX_POLYGON_VERTICES
                ? (item.vertices.length - 2) * 3
                : 0;
    }
}

function getPreparedPosition(
    item: RenderItem2D,
    alpha: number,
): Pick<Render2DPreparedItem, "x" | "y"> {
    if (item.kind === "line") {
        return {};
    }

    const transform = resolveRenderTransform2D(item, alpha);

    return {
        x: transform.x,
        y: transform.y,
    };
}

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
    const layerRecords: MutableLayerRecord[] = [];
    const itemSortRecords: MutableItemSortRecord[] = [];
    const preparedItems: MutablePreparedItem[] = [];
    const preparedBatches: MutablePreparedBatch[] = [];
    let layerRecordCount = 0;
    let itemSortRecordCount = 0;
    let preparedItemCount = 0;
    let preparedBatchCount = 0;

    function resetFrameArenas(): void {
        layerRecordCount = 0;
        itemSortRecordCount = 0;
        preparedItemCount = 0;
        preparedBatchCount = 0;
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

    function appendPreparedItem(
        layer: IndexedRenderLayer,
        sourceIndex: number,
        item: RenderItem2D,
        vertexCount: number,
        alpha: number,
    ): void {
        const index = preparedItemCount;
        const record =
            preparedItems[index] ??
            (preparedItems[index] = {
                layerId: layer.layerId,
                layerOrder: layer.layerOrder,
                sourceIndex,
                sortKey: item.sortKey,
                kind: item.kind,
                pipelineFamily: getPipelineFamily(item),
                vertexLayout: getVertexLayout(item),
                blendMode: getBlendMode(item),
                resourceId: item.resourceId,
                vertexCount,
            });
        const position = getPreparedPosition(item, alpha);

        record.layerId = layer.layerId;
        record.layerOrder = layer.layerOrder;
        record.sourceIndex = sourceIndex;
        record.sortKey = item.sortKey;
        record.kind = item.kind;
        record.pipelineFamily = getPipelineFamily(item);
        record.vertexLayout = getVertexLayout(item);
        record.blendMode = getBlendMode(item);
        record.resourceId = item.resourceId;
        record.vertexCount = vertexCount;
        record.x = position.x;
        record.y = position.y;
        preparedItemCount++;
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
                itemStart,
                itemCount,
                vertexCount,
            });

        batch.layerId = item.layerId;
        batch.pipelineFamily = item.pipelineFamily;
        batch.vertexLayout = item.vertexLayout;
        batch.blendMode = item.blendMode;
        batch.resourceId = item.resourceId;
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
                    const vertexCount = getItemVertexCount(indexedItem.item);

                    if (vertexCount === 0) {
                        continue;
                    }

                    appendPreparedItem(
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
            for (let i = 0; i < preparedItemCount; i++) {
                vertexCount += preparedItems[i].vertexCount;
            }

            const stats = {
                ...createEmptyStats(),
                passCount: layerRecordCount,
                commandCount: preparedItemCount,
                batchCount: preparedBatchCount,
                vertexCount,
            };

            return {
                target: input.target,
                items: preparedItems,
                itemCount: preparedItemCount,
                batches: preparedBatches,
                batchCount: preparedBatchCount,
                stats,
            };
        },
    });
}
