import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
    Render2DPreparedItem,
} from "./Render2DPrepare.module";
import { BYTES_PER_FLOAT } from "./Render2DGeometryLayout.module";
import {
    RENDER_2D_INSTANCE_LAYOUTS,
    writeRender2DQuadInstanceDataAtOffset,
    writeRender2DPrimitiveInstanceDataAtOffset,
    type Render2DInstanceLayoutInfo,
    type Render2DInstanceLayoutKey,
} from "./Render2DInstancePacking.module";

export type Render2DGeometryUploadLayoutKey =
    Render2DInstanceLayoutKey;

export type Render2DGeometryUploadRangeKind = "instances";

export type Render2DGeometryUploadLayoutInfo =
    Render2DInstanceLayoutInfo;

export type Render2DGeometryUploadRange = Readonly<{
    kind: Render2DGeometryUploadRangeKind;
    batchIndex: number;
    layout: Render2DGeometryUploadLayoutKey;
    itemStart: number;
    itemCount: number;
    floatOffset: number;
    floatLength: number;
    byteOffset: number;
    byteLength: number;
    vertexOffset: number;
    vertexCount: number;
    instanceOffset: number;
    instanceCount: number;
    staticGeometryKey?: string;
}>;

export type Render2DLayoutUpload = Readonly<{
    layout: Render2DGeometryUploadLayoutKey;
    layoutInfo: Render2DGeometryUploadLayoutInfo;
    data: Float32Array<ArrayBufferLike>;
    floatLength: number;
    byteLength: number;
    capacityFloats: number;
    ranges: readonly Render2DGeometryUploadRange[];
}>;

export type Render2DGeometryUploadRangeTable = ReadonlyArray<
    Render2DGeometryUploadRange | undefined
>;

export type Render2DGeometryUploadFrameStats = Readonly<{
    layoutUploadCount: number;
    rangeCount: number;
    uploadByteLength: number;
    uploadFloatLength: number;
}>;

export type Render2DGeometryUploadFrame = Readonly<{
    source: Render2DPreparedFrame;
    layouts: readonly Render2DLayoutUpload[];
    ranges: readonly Render2DGeometryUploadRange[];
    rangesByBatchIndex: Render2DGeometryUploadRangeTable;
    stats: Render2DGeometryUploadFrameStats;
}>;

export type Render2DGeometryUpload = Readonly<{
    build(frame: Render2DPreparedFrame): Render2DGeometryUploadFrame;
}>;

type MutableLayoutUpload = {
    layout: Render2DGeometryUploadLayoutKey;
    layoutInfo: Render2DGeometryUploadLayoutInfo;
    data: Float32Array<ArrayBufferLike>;
    floatLength: number;
    byteLength: number;
    capacityFloats: number;
    ranges: Render2DGeometryUploadRange[];
    active: boolean;
};

type MutableGeometryUploadRange = {
    -readonly [Key in keyof Render2DGeometryUploadRange]: Render2DGeometryUploadRange[Key];
};

type MutableGeometryUploadFrameStats = {
    -readonly [Key in keyof Render2DGeometryUploadFrameStats]: Render2DGeometryUploadFrameStats[Key];
};

type MutableGeometryUploadFrame = {
    -readonly [Key in keyof Render2DGeometryUploadFrame]: Render2DGeometryUploadFrame[Key];
};

function getUploadItemLayout(
    item: Render2DPreparedItem,
): Render2DGeometryUploadLayoutKey | undefined {
    switch (item.geometry.kind) {
        case "rect-quad":
            if (item.vertexCount !== 6) return undefined;
            if (item.sourceKind !== "rect" && item.sourceKind !== "sprite") {
                return undefined;
            }
            return item.pipelineFamily === "textured-2d"
                ? "quad-textured-instance-2d"
                : "quad-solid-instance-2d";
        case "glyph-quad":
            if (item.vertexCount !== 6 || item.sourceKind !== "text") {
                return undefined;
            }
            return item.pipelineFamily === "textured-2d"
                ? "quad-textured-instance-2d"
                : "quad-solid-instance-2d";
        case "line":
            return "line-solid-instance-2d";
        case "circle-like":
            return "circle-solid-instance-2d";
        case "polygon":
            return "polygon-solid-instance-2d";
    }
}

export function createRender2DGeometryUpload(): Render2DGeometryUpload {
    const uploadsByLayout = new Map<Render2DGeometryUploadLayoutKey, MutableLayoutUpload>();
    const activeUploads: MutableLayoutUpload[] = [];
    const orderedRanges: Render2DGeometryUploadRange[] = [];
    const rangesByBatchIndex: Array<Render2DGeometryUploadRange | undefined> = [];
    const activeRangeBatchIndices: number[] = [];
    const rangeRecords: MutableGeometryUploadRange[] = [];
    const packedRangeScratch = {
        data: new Float32Array(0),
        offset: 0,
        length: 0,
        nextOffset: 0,
    };
    const uploadStats: MutableGeometryUploadFrameStats = {
        layoutUploadCount: 0,
        rangeCount: 0,
        uploadByteLength: 0,
        uploadFloatLength: 0,
    };
    const uploadFrame: MutableGeometryUploadFrame = {
        source: undefined as unknown as Render2DPreparedFrame,
        layouts: activeUploads,
        ranges: orderedRanges,
        rangesByBatchIndex,
        stats: uploadStats,
    };

    function resetFrameState(frame: Render2DPreparedFrame): void {
        for (let i = 0; i < activeRangeBatchIndices.length; i++) {
            rangesByBatchIndex[activeRangeBatchIndices[i]] = undefined;
        }
        activeRangeBatchIndices.length = 0;
        activeUploads.length = 0;
        orderedRanges.length = 0;
        rangesByBatchIndex.length = frame.batchCount;

        for (const upload of uploadsByLayout.values()) {
            upload.floatLength = 0;
            upload.byteLength = 0;
            upload.ranges.length = 0;
            upload.active = false;
        }
    }

    function getLayoutUpload(
        layout: Render2DGeometryUploadLayoutKey,
    ): MutableLayoutUpload {
        let upload = uploadsByLayout.get(layout);
        if (upload) return upload;

        upload = {
            layout,
            layoutInfo: RENDER_2D_INSTANCE_LAYOUTS[layout],
            data: new Float32Array(0),
            floatLength: 0,
            byteLength: 0,
            capacityFloats: 0,
            ranges: [],
            active: false,
        };
        uploadsByLayout.set(layout, upload);

        return upload;
    }

    function activateUpload(upload: MutableLayoutUpload): void {
        if (upload.active) return;
        upload.active = true;
        activeUploads.push(upload);
    }

    function appendInstanceRange(
        upload: MutableLayoutUpload,
        frame: Render2DPreparedFrame,
        batchIndex: number,
        itemStart: number,
        itemCount: number,
        vertexCount: number,
        staticGeometryKey?: string,
    ): void {
        const floatOffset = upload.floatLength;
        const layout = upload.layout as Render2DInstanceLayoutKey;
        const written =
            layout === "quad-solid-instance-2d" ||
            layout === "quad-textured-instance-2d"
                ? writeRender2DQuadInstanceDataAtOffset(
                      upload.data,
                      frame,
                      itemStart,
                      itemCount,
                      layout,
                      floatOffset,
                      packedRangeScratch,
                  )
                : writeRender2DPrimitiveInstanceDataAtOffset(
                      upload.data,
                      frame,
                      itemStart,
                      itemCount,
                      layout,
                      floatOffset,
                      packedRangeScratch,
                  );
        const instanceOffset = Math.floor(
            written.offset / upload.layoutInfo.strideFloats,
        );

        upload.data = written.data;
        upload.floatLength = written.nextOffset;
        upload.byteLength = upload.floatLength * BYTES_PER_FLOAT;
        upload.capacityFloats = upload.data.length;

        const floatLength = written.length;
        const rangeIndex = orderedRanges.length;
        const range =
            rangeRecords[rangeIndex] ??
            (rangeRecords[rangeIndex] = {
                kind: "instances",
                batchIndex: 0,
                layout: upload.layout,
                itemStart: 0,
                itemCount: 0,
                floatOffset: 0,
                floatLength: 0,
                byteOffset: 0,
                byteLength: 0,
                vertexOffset: 0,
                vertexCount: 0,
                instanceOffset: 0,
                instanceCount: 0,
            });

        range.kind = "instances";
        range.batchIndex = batchIndex;
        range.layout = upload.layout;
        range.itemStart = itemStart;
        range.itemCount = itemCount;
        range.floatOffset = written.offset;
        range.floatLength = floatLength;
        range.byteOffset = written.offset * BYTES_PER_FLOAT;
        range.byteLength = floatLength * BYTES_PER_FLOAT;
        range.vertexOffset = 0;
        range.vertexCount = vertexCount;
        range.instanceOffset = instanceOffset;
        range.instanceCount = itemCount;
        range.staticGeometryKey = staticGeometryKey;

        upload.ranges.push(range);
        orderedRanges.push(range);
        if (rangesByBatchIndex[batchIndex] === undefined) {
            rangesByBatchIndex[batchIndex] = range;
            activeRangeBatchIndices.push(batchIndex);
        }
    }

    function appendBatchRuns(
        frame: Render2DPreparedFrame,
        batchIndex: number,
        batch: Render2DPreparedBatch,
    ): void {
        if (batch.itemCount === 1) {
            const item = frame.items[batch.itemStart];
            const layout = getUploadItemLayout(item);
            if (!layout) return;
            const upload = getLayoutUpload(layout);
            activateUpload(upload);
            appendInstanceRange(
                upload,
                frame,
                batchIndex,
                batch.itemStart,
                1,
                item.vertexCount,
                item.geometry.kind === "polygon"
                    ? item.geometry.localGeometryKey
                    : undefined,
            );
            return;
        }

        let runStart = 0;
        let runItemCount = 0;
        let runVertexCount = 0;
        let runLayout: Render2DGeometryUploadLayoutKey | undefined;
        let runStaticGeometryKey: string | undefined;

        for (let i = 0; i < batch.itemCount; i++) {
            const itemIndex = batch.itemStart + i;
            const item = frame.items[itemIndex];
            const itemLayout = getUploadItemLayout(item);
            if (!itemLayout) continue;
            const itemStaticGeometryKey =
                item.geometry.kind === "polygon"
                    ? item.geometry.localGeometryKey
                    : undefined;

            if (
                runItemCount > 0 &&
                (itemLayout !== runLayout ||
                    itemStaticGeometryKey !== runStaticGeometryKey)
            ) {
                if (runLayout && runVertexCount > 0) {
                    const upload = getLayoutUpload(runLayout);
                    activateUpload(upload);
                    appendInstanceRange(
                        upload,
                        frame,
                        batchIndex,
                        runStart,
                        runItemCount,
                        runVertexCount,
                        runStaticGeometryKey,
                    );
                }
                runItemCount = 0;
                runVertexCount = 0;
            }

            if (runItemCount === 0) runStart = itemIndex;
            runLayout = itemLayout;
            runStaticGeometryKey = itemStaticGeometryKey;
            runItemCount++;
            runVertexCount += item.vertexCount;
        }

        if (runItemCount <= 0 || runVertexCount <= 0 || !runLayout) return;
        const upload = getLayoutUpload(runLayout);
        activateUpload(upload);
        appendInstanceRange(
            upload,
            frame,
            batchIndex,
            runStart,
            runItemCount,
            runVertexCount,
            runStaticGeometryKey,
        );
    }

    function writeStats(): Render2DGeometryUploadFrameStats {
        let rangeCount = 0;
        let uploadByteLength = 0;
        let uploadFloatLength = 0;

        for (const upload of activeUploads) {
            rangeCount += upload.ranges.length;
            uploadByteLength += upload.byteLength;
            uploadFloatLength += upload.floatLength;
        }

        uploadStats.layoutUploadCount = activeUploads.length;
        uploadStats.rangeCount = rangeCount;
        uploadStats.uploadByteLength = uploadByteLength;
        uploadStats.uploadFloatLength = uploadFloatLength;

        return uploadStats;
    }

    return Object.freeze({
        build(frame: Render2DPreparedFrame): Render2DGeometryUploadFrame {
            resetFrameState(frame);

            for (let batchIndex = 0; batchIndex < frame.batchCount; batchIndex++) {
                const batch = frame.batches[batchIndex];
                if (batch.vertexCount <= 0) continue;

                appendBatchRuns(frame, batchIndex, batch);
            }

            uploadFrame.source = frame;
            uploadFrame.stats = writeStats();

            return uploadFrame;
        },
    });
}
