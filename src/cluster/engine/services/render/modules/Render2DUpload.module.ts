import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
} from "./Render2DPrepare.module";
import {
    BYTES_PER_FLOAT,
    RENDER_2D_VERTEX_LAYOUTS,
    writeRender2DBatchVertexDataAtOffset,
    type Render2DVertexLayoutInfo,
} from "./Render2DVertexPacking.module";
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

export type Render2DUploadLayoutKey =
    | Render2DPreparedBatch["vertexLayout"]
    | Render2DInstanceLayoutKey;

export type Render2DUploadRangeKind = "vertices" | "instances";

export type Render2DUploadLayoutInfo =
    | Render2DVertexLayoutInfo
    | Render2DInstanceLayoutInfo;

export type Render2DUploadRange = Readonly<{
    kind: Render2DUploadRangeKind;
    batchIndex: number;
    layout: Render2DUploadLayoutKey;
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
    layout: Render2DUploadLayoutKey;
    layoutInfo: Render2DUploadLayoutInfo;
    data: Float32Array<ArrayBufferLike>;
    floatLength: number;
    byteLength: number;
    capacityFloats: number;
    ranges: readonly Render2DUploadRange[];
}>;

export type Render2DUploadRangeTable = ReadonlyArray<
    Render2DUploadRange | undefined
>;

export type Render2DUploadFrameStats = Readonly<{
    layoutUploadCount: number;
    rangeCount: number;
    uploadByteLength: number;
    uploadFloatLength: number;
}>;

export type Render2DUploadFrame = Readonly<{
    source: Render2DPreparedFrame;
    layouts: readonly Render2DLayoutUpload[];
    ranges: readonly Render2DUploadRange[];
    rangesByBatchIndex: Render2DUploadRangeTable;
    stats: Render2DUploadFrameStats;
}>;

export type Render2DUploadBatchWriteResult = Readonly<{
    data: Float32Array<ArrayBufferLike>;
    floatOffset: number;
    floatLength: number;
    nextFloatOffset: number;
}>;

export type Render2DUploadBatchWriter = (
    arena: Float32Array<ArrayBufferLike>,
    frame: Render2DPreparedFrame,
    batch: Render2DPreparedBatch,
    floatOffset: number,
) => Render2DUploadBatchWriteResult;

export type Render2DUploadConfig = Readonly<{
    batchWriter?: Render2DUploadBatchWriter;
}>;

export type Render2DUpload = Readonly<{
    build(frame: Render2DPreparedFrame): Render2DUploadFrame;
}>;

type MutableLayoutUpload = {
    layout: Render2DUploadLayoutKey;
    layoutInfo: Render2DUploadLayoutInfo;
    data: Float32Array<ArrayBufferLike>;
    floatLength: number;
    byteLength: number;
    capacityFloats: number;
    ranges: Render2DUploadRange[];
    active: boolean;
};

const EMPTY_UPLOAD_STATS: Render2DUploadFrameStats = Object.freeze({
    layoutUploadCount: 0,
    rangeCount: 0,
    uploadByteLength: 0,
    uploadFloatLength: 0,
});

function defaultBatchWriter(
    arena: Float32Array<ArrayBufferLike>,
    frame: Render2DPreparedFrame,
    batch: Render2DPreparedBatch,
    floatOffset: number,
): Render2DUploadBatchWriteResult {
    const written = writeRender2DBatchVertexDataAtOffset(
        arena,
        frame,
        batch,
        floatOffset,
    );

    return {
        data: written.data,
        floatOffset: written.offset,
        floatLength: written.length,
        nextFloatOffset: written.nextOffset,
    };
}

export function createRender2DUpload(
    config: Render2DUploadConfig = {},
): Render2DUpload {
    const batchWriter = config.batchWriter ?? defaultBatchWriter;
    const uploadsByLayout = new Map<Render2DUploadLayoutKey, MutableLayoutUpload>();
    const activeUploads: MutableLayoutUpload[] = [];
    const orderedRanges: Render2DUploadRange[] = [];
    const rangesByBatchIndex: Array<Render2DUploadRange | undefined> = [];

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
        layout: Render2DUploadLayoutKey,
    ): MutableLayoutUpload {
        let upload = uploadsByLayout.get(layout);
        if (upload) return upload;

        upload = {
            layout,
            layoutInfo:
                layout in RENDER_2D_INSTANCE_LAYOUTS
                    ? RENDER_2D_INSTANCE_LAYOUTS[
                          layout as Render2DInstanceLayoutKey
                      ]
                    : RENDER_2D_VERTEX_LAYOUTS[
                          layout as Render2DPreparedBatch["vertexLayout"]
                      ],
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

    function appendVertexRange(
        upload: MutableLayoutUpload,
        frame: Render2DPreparedFrame,
        batchIndex: number,
        batch: Render2DPreparedBatch,
        itemStart: number,
        itemCount: number,
        vertexCount: number,
    ): void {
        const floatOffset = upload.floatLength;
        const runBatch: Render2DPreparedBatch = {
            ...batch,
            itemStart,
            itemCount,
            vertexCount,
        };
        const written = batchWriter(upload.data, frame, runBatch, floatOffset);
        const vertexOffset = Math.floor(
            written.floatOffset / upload.layoutInfo.strideFloats,
        );

        upload.data = written.data;
        upload.floatLength = written.nextFloatOffset;
        upload.byteLength = upload.floatLength * BYTES_PER_FLOAT;
        upload.capacityFloats = upload.data.length;

        const floatLength = written.floatLength;
        const range: Render2DUploadRange = {
            kind: "vertices",
            batchIndex,
            layout: upload.layout,
            itemStart,
            itemCount,
            floatOffset: written.floatOffset,
            floatLength,
            byteOffset: written.floatOffset * BYTES_PER_FLOAT,
            byteLength: floatLength * BYTES_PER_FLOAT,
            vertexOffset,
            vertexCount,
            instanceOffset: 0,
            instanceCount: 0,
        };

        upload.ranges.push(range);
        orderedRanges.push(range);
        rangesByBatchIndex[batchIndex] ??= range;
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
        const range: Render2DUploadRange = {
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
        let runInstances = false;
        let runLayout: Render2DUploadLayoutKey = batch.vertexLayout;
        let runStaticGeometryKey: string | undefined;

        function flushRun(): void {
            if (runItemCount <= 0 || runVertexCount <= 0) return;
            const upload = getLayoutUpload(runLayout);
            activateUpload(upload);
            if (runInstances) {
                appendInstanceRange(
                    upload,
                    frame,
                    batchIndex,
                    runStart,
                    runItemCount,
                    runVertexCount,
                    runStaticGeometryKey,
                );
            } else {
                appendVertexRange(
                    upload,
                    frame,
                    batchIndex,
                    batch,
                    runStart,
                    runItemCount,
                    runVertexCount,
                );
            }
        }

        for (let i = 0; i < batch.itemCount; i++) {
            const itemIndex = batch.itemStart + i;
            const item = frame.items[itemIndex];
            const itemInstances =
                isRender2DQuadInstanceItem(item) ||
                isRender2DPrimitiveInstanceItem(item);
            const itemLayout = itemInstances
                ? isRender2DQuadInstanceItem(item)
                    ? getRender2DQuadInstanceLayout(item)
                    : getRender2DPrimitiveInstanceLayout(item)
                : batch.vertexLayout;
            const itemStaticGeometryKey =
                item.geometry.kind === "polygon"
                    ? item.geometry.localGeometryKey
                    : undefined;

            if (
                runItemCount > 0 &&
                (itemInstances !== runInstances ||
                    itemLayout !== runLayout ||
                    itemStaticGeometryKey !== runStaticGeometryKey)
            ) {
                flushRun();
                runStart = itemIndex;
                runItemCount = 0;
                runVertexCount = 0;
            }

            runInstances = itemInstances;
            runLayout = itemLayout;
            runStaticGeometryKey = itemStaticGeometryKey;
            runItemCount++;
            runVertexCount += item.vertexCount;
        }

        flushRun();
    }

    function createStats(): Render2DUploadFrameStats {
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
        build(frame: Render2DPreparedFrame): Render2DUploadFrame {
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
