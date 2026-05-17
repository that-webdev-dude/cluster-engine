import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
} from "./Render2DPrepare.module";
import { BYTES_PER_FLOAT } from "./Render2DGeometryLayout.module";
import {
    getRender2DQuadInstanceLayout,
    getRender2DPrimitiveInstanceLayout,
    isRender2DQuadInstanceItem,
    isRender2DPrimitiveInstanceItem,
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

const EMPTY_UPLOAD_STATS: Render2DGeometryUploadFrameStats = Object.freeze({
    layoutUploadCount: 0,
    rangeCount: 0,
    uploadByteLength: 0,
    uploadFloatLength: 0,
});

export function createRender2DGeometryUpload(): Render2DGeometryUpload {
    const uploadsByLayout = new Map<Render2DGeometryUploadLayoutKey, MutableLayoutUpload>();
    const activeUploads: MutableLayoutUpload[] = [];
    const orderedRanges: Render2DGeometryUploadRange[] = [];
    const rangesByBatchIndex: Array<Render2DGeometryUploadRange | undefined> = [];

    function resetFrameState(frame: Render2DPreparedFrame): void {
        activeUploads.length = 0;
        orderedRanges.length = 0;
        rangesByBatchIndex.length = frame.batchCount;
        rangesByBatchIndex.fill(undefined);

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
                  )
                : writeRender2DPrimitiveInstanceDataAtOffset(
                      upload.data,
                      frame,
                      itemStart,
                      itemCount,
                      layout,
                      floatOffset,
                  );
        const instanceOffset = Math.floor(
            written.offset / upload.layoutInfo.strideFloats,
        );

        upload.data = written.data;
        upload.floatLength = written.nextOffset;
        upload.byteLength = upload.floatLength * BYTES_PER_FLOAT;
        upload.capacityFloats = upload.data.length;

        const floatLength = written.length;
        const range: Render2DGeometryUploadRange = {
            kind: "instances",
            batchIndex,
            layout: upload.layout,
            itemStart,
            itemCount,
            floatOffset: written.offset,
            floatLength,
            byteOffset: written.offset * BYTES_PER_FLOAT,
            byteLength: floatLength * BYTES_PER_FLOAT,
            vertexOffset: 0,
            vertexCount,
            instanceOffset,
            instanceCount: itemCount,
            staticGeometryKey,
        };

        upload.ranges.push(range);
        orderedRanges.push(range);
        rangesByBatchIndex[batchIndex] ??= range;
    }

    function appendBatchRuns(
        frame: Render2DPreparedFrame,
        batchIndex: number,
        batch: Render2DPreparedBatch,
    ): void {
        let runStart = batch.itemStart;
        let runItemCount = 0;
        let runVertexCount = 0;
        let runLayout: Render2DGeometryUploadLayoutKey | undefined;
        let runStaticGeometryKey: string | undefined;

        function flushRun(): void {
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

        for (let i = 0; i < batch.itemCount; i++) {
            const itemIndex = batch.itemStart + i;
            const item = frame.items[itemIndex];
            const itemInstances =
                isRender2DQuadInstanceItem(item) ||
                isRender2DPrimitiveInstanceItem(item);
            if (!itemInstances) continue;
            const itemLayout = isRender2DQuadInstanceItem(item)
                ? getRender2DQuadInstanceLayout(item)
                : getRender2DPrimitiveInstanceLayout(item);
            const itemStaticGeometryKey =
                item.geometry.kind === "polygon"
                    ? item.geometry.localGeometryKey
                    : undefined;

            if (
                runItemCount > 0 &&
                (itemLayout !== runLayout ||
                    itemStaticGeometryKey !== runStaticGeometryKey)
            ) {
                flushRun();
                runStart = itemIndex;
                runItemCount = 0;
                runVertexCount = 0;
            }

            runLayout = itemLayout;
            runStaticGeometryKey = itemStaticGeometryKey;
            runItemCount++;
            runVertexCount += item.vertexCount;
        }

        flushRun();
    }

    function createStats(): Render2DGeometryUploadFrameStats {
        if (activeUploads.length === 0) return EMPTY_UPLOAD_STATS;

        let rangeCount = 0;
        let uploadByteLength = 0;
        let uploadFloatLength = 0;

        for (const upload of activeUploads) {
            rangeCount += upload.ranges.length;
            uploadByteLength += upload.byteLength;
            uploadFloatLength += upload.floatLength;
        }

        return {
            layoutUploadCount: activeUploads.length,
            rangeCount,
            uploadByteLength,
            uploadFloatLength,
        };
    }

    return Object.freeze({
        build(frame: Render2DPreparedFrame): Render2DGeometryUploadFrame {
            resetFrameState(frame);

            for (let batchIndex = 0; batchIndex < frame.batchCount; batchIndex++) {
                const batch = frame.batches[batchIndex];
                if (batch.vertexCount <= 0) continue;

                appendBatchRuns(frame, batchIndex, batch);
            }

            return {
                source: frame,
                layouts: activeUploads,
                ranges: orderedRanges,
                rangesByBatchIndex,
                stats: createStats(),
            };
        },
    });
}
