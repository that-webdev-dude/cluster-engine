import { resolveRenderTransform2D } from "./Interpolation.module";
import type {
    RenderFrameInput,
    RenderFrameStats,
    RenderItem2D,
    RenderLayerId,
    RenderTargetInfo,
} from "../service/Render.types";

export type Render2DPreparedItem = Readonly<{
    layerId: RenderLayerId;
    layerOrder: number;
    sourceIndex: number;
    sortKey: number;
    kind: RenderItem2D["kind"];
    vertexCount: number;
    x?: number;
    y?: number;
}>;

export type Render2DPreparedFrame = Readonly<{
    target: RenderTargetInfo;
    items: readonly Render2DPreparedItem[];
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
    layerId: RenderLayerId;
    layerOrder: number;
    sourceIndex: number;
    item: RenderItem2D;
}>;

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
            const length = Math.hypot(item.endX - item.startX, item.endY - item.startY);

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

    return Object.freeze({
        prepare(input: RenderFrameInput): Render2DPreparedFrame {
            assertValidAlpha(input, debug);

            const sortedLayers = input.layers
                .map((layer, sourceLayerIndex) => ({
                    layerId: layer.id,
                    layerOrder: layer.order,
                    sourceLayerIndex,
                    items: layer.items,
                }))
                .sort(compareLayers);

            const preparedItems: Render2DPreparedItem[] = [];

            for (const layer of sortedLayers) {
                const sortedItems = layer.items
                    .map((item, sourceIndex) => ({
                        layerId: layer.layerId,
                        layerOrder: layer.layerOrder,
                        sourceIndex,
                        item,
                    }))
                    .sort(compareItems);

                for (const indexedItem of sortedItems) {
                    const vertexCount = getItemVertexCount(indexedItem.item);

                    if (vertexCount === 0) {
                        continue;
                    }

                    preparedItems.push({
                        layerId: indexedItem.layerId,
                        layerOrder: indexedItem.layerOrder,
                        sourceIndex: indexedItem.sourceIndex,
                        sortKey: indexedItem.item.sortKey,
                        kind: indexedItem.item.kind,
                        vertexCount,
                        ...getPreparedPosition(indexedItem.item, input.alpha),
                    });
                }
            }

            const stats = {
                ...createEmptyStats(),
                passCount: sortedLayers.length,
                commandCount: preparedItems.length,
                batchCount: preparedItems.length,
                vertexCount: preparedItems.reduce(
                    (total, item) => total + item.vertexCount,
                    0,
                ),
            };

            return {
                target: input.target,
                items: preparedItems,
                stats,
            };
        },
    });
}
