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

export type Render2DUploadLayoutKey = Render2DPreparedBatch["vertexLayout"];

export type Render2DUploadRange = Readonly<{
    batchIndex: number;
    layout: Render2DUploadLayoutKey;
    floatOffset: number;
    floatLength: number;
    byteOffset: number;
    byteLength: number;
    vertexOffset: number;
    vertexCount: number;
}>;

export type Render2DLayoutUpload = Readonly<{
    layout: Render2DUploadLayoutKey;
    layoutInfo: Render2DVertexLayoutInfo;
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
    layoutInfo: Render2DVertexLayoutInfo;
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
    const rangesByBatchIndex: Array<Render2DUploadRange | undefined> = [];

    function resetFrameState(frame: Render2DPreparedFrame): void {
        activeUploads.length = 0;
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
            layoutInfo: RENDER_2D_VERTEX_LAYOUTS[layout],
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

    function appendBatchRange(
        upload: MutableLayoutUpload,
        frame: Render2DPreparedFrame,
        batchIndex: number,
        batch: Render2DPreparedBatch,
    ): void {
        const floatOffset = upload.floatLength;
        const written = batchWriter(upload.data, frame, batch, floatOffset);
        const vertexOffset = Math.floor(
            written.floatOffset / upload.layoutInfo.strideFloats,
        );

        upload.data = written.data;
        upload.floatLength = written.nextFloatOffset;
        upload.byteLength = upload.floatLength * BYTES_PER_FLOAT;
        upload.capacityFloats = upload.data.length;

        const floatLength = written.floatLength;
        const range: Render2DUploadRange = {
            batchIndex,
            layout: upload.layout,
            floatOffset: written.floatOffset,
            floatLength,
            byteOffset: written.floatOffset * BYTES_PER_FLOAT,
            byteLength: floatLength * BYTES_PER_FLOAT,
            vertexOffset,
            vertexCount: batch.vertexCount,
        };

        upload.ranges.push(range);
        rangesByBatchIndex[batchIndex] = range;
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

                const upload = getLayoutUpload(batch.vertexLayout);
                activateUpload(upload);
                appendBatchRange(upload, frame, batchIndex, batch);
            }

            return {
                source: frame,
                layouts: activeUploads,
                rangesByBatchIndex,
                stats: createStats(),
            };
        },
    });
}
