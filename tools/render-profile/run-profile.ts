/// <reference path="./node-shims.d.ts" />

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createRender2DPrepare } from "../../src/cluster/engine/services/render/modules/Render2DPrepare.module";
import { createRender2DGeometryUpload } from "../../src/cluster/engine/services/render/modules/Render2DGeometryUpload.module";
import {
    createRenderProfileScenarios,
    type RenderProfileScenario,
} from "./scenarios";
import { summarizeTimingSeries, type TimingSummary } from "./summary";

export const RENDER_PROFILE_WARMUP_FRAMES = 30;
export const RENDER_PROFILE_SAMPLE_FRAMES = 120;

type RenderProfileStats = Readonly<{
    commandCount: number;
    batchCount: number;
    vertexCount: number;
    uploadByteLength: number;
    uploadFloatLength: number;
    rangeCount: number;
    layoutUploadCount: number;
}>;

export type RenderProfileScenarioResult = Readonly<{
    profileVersion: 1;
    scenario: string;
    source: RenderProfileScenario["source"];
    itemCount: number;
    warmupFrames: number;
    sampleFrames: number;
    frameCpuMs: TimingSummary;
    extractMs: TimingSummary;
    prepareMs: TimingSummary;
    uploadBuildMs: TimingSummary;
    submitCpuMs: TimingSummary;
    totalCpuMs: TimingSummary;
    stats: RenderProfileStats;
}>;

export type RenderProfileSummary = Readonly<{
    profileVersion: 1;
    commandUsed: string;
    warmupFrames: number;
    sampleFrames: number;
    scenarios: readonly RenderProfileScenarioResult[];
}>;

type MutableTimingSamples = {
    frameCpuMs: number[];
    extractMs: number[];
    prepareMs: number[];
    uploadBuildMs: number[];
    submitCpuMs: number[];
    totalCpuMs: number[];
};

function createTimingSamples(): MutableTimingSamples {
    return {
        frameCpuMs: [],
        extractMs: [],
        prepareMs: [],
        uploadBuildMs: [],
        submitCpuMs: [],
        totalCpuMs: [],
    };
}

function roundTiming(summary: TimingSummary): TimingSummary {
    return {
        min: Number(summary.min.toFixed(4)),
        median: Number(summary.median.toFixed(4)),
        p95: Number(summary.p95.toFixed(4)),
        mean: Number(summary.mean.toFixed(4)),
    };
}

function measureScenario(
    scenario: RenderProfileScenario,
    options: {
        warmupFrames: number;
        sampleFrames: number;
    },
): RenderProfileScenarioResult {
    const prepare = createRender2DPrepare();
    const upload = createRender2DGeometryUpload();
    const samples = createTimingSamples();
    let stats: RenderProfileStats = {
        commandCount: 0,
        batchCount: 0,
        vertexCount: 0,
        uploadByteLength: 0,
        uploadFloatLength: 0,
        rangeCount: 0,
        layoutUploadCount: 0,
    };

    for (
        let frameIndex = 0;
        frameIndex < options.warmupFrames + options.sampleFrames;
        frameIndex++
    ) {
        const isSample = frameIndex >= options.warmupFrames;
        const frameStart = globalThis.performance.now();
        const extractStart = globalThis.performance.now();
        const input =
            scenario.source === "world-backed"
                ? scenario.extract()
                : scenario.input;
        const extractEnd = globalThis.performance.now();
        const prepareStart = globalThis.performance.now();
        const preparedFrame = prepare.prepare(input);
        const prepareEnd = globalThis.performance.now();
        const uploadStart = globalThis.performance.now();
        const uploadFrame = upload.build(preparedFrame);
        const uploadEnd = globalThis.performance.now();
        const submitCpuMs = 0;
        const frameEnd = globalThis.performance.now();

        stats = {
            commandCount: preparedFrame.stats.commandCount,
            batchCount: preparedFrame.stats.batchCount,
            vertexCount: preparedFrame.stats.vertexCount,
            uploadByteLength: uploadFrame.stats.uploadByteLength,
            uploadFloatLength: uploadFrame.stats.uploadFloatLength,
            rangeCount: uploadFrame.stats.rangeCount,
            layoutUploadCount: uploadFrame.stats.layoutUploadCount,
        };

        if (!isSample) continue;

        const extractMs =
            scenario.source === "world-backed" ? extractEnd - extractStart : 0;
        const prepareMs = prepareEnd - prepareStart;
        const uploadBuildMs = uploadEnd - uploadStart;

        samples.frameCpuMs.push(frameEnd - frameStart);
        samples.extractMs.push(extractMs);
        samples.prepareMs.push(prepareMs);
        samples.uploadBuildMs.push(uploadBuildMs);
        samples.submitCpuMs.push(submitCpuMs);
        samples.totalCpuMs.push(extractMs + prepareMs + uploadBuildMs + submitCpuMs);
    }

    const frameCpuMs = roundTiming(summarizeTimingSeries(samples.frameCpuMs));

    return {
        profileVersion: 1,
        scenario: scenario.name,
        source: scenario.source,
        itemCount: scenario.itemCount,
        warmupFrames: options.warmupFrames,
        sampleFrames: options.sampleFrames,
        frameCpuMs,
        extractMs: roundTiming(summarizeTimingSeries(samples.extractMs)),
        prepareMs: roundTiming(summarizeTimingSeries(samples.prepareMs)),
        uploadBuildMs: roundTiming(summarizeTimingSeries(samples.uploadBuildMs)),
        submitCpuMs: roundTiming(summarizeTimingSeries(samples.submitCpuMs)),
        totalCpuMs: roundTiming(summarizeTimingSeries(samples.totalCpuMs)),
        stats,
    };
}

function createReadme(commandUsed: string): string {
    return [
        "# Render Profile Current Baseline",
        "",
        "Generated by the Phase 00a CPU-side renderer profiling harness.",
        "",
        `Command: \`${commandUsed}\``,
        "",
        "- No browser, canvas, WebGL2, or WebGPU context is required.",
        "- Renderer-only scenarios use prebuilt `RenderFrameInput` and report `extractMs` as zero.",
        "- World-backed scenarios populate `WorldManager` storage and call `extractRenderFrameInput(...)` every measured frame.",
        "- `submitCpuMs` is zero because this baseline does not include a backend-free fake submit path.",
        "- `totalCpuMs` is the measured sum of `extractMs`, `prepareMs`, `uploadBuildMs`, and `submitCpuMs`.",
        "- Scenario JSON files and `summary.json` are written in this directory.",
        "",
    ].join("\n");
}

export async function runRenderProfile(options: {
    outputDir?: string;
    commandUsed?: string;
    warmupFrames?: number;
    sampleFrames?: number;
} = {}): Promise<RenderProfileSummary> {
    const outputDir =
        options.outputDir ?? join(process.cwd(), ".artifacts", "render-profile", "current");
    const commandUsed = options.commandUsed ?? "npm.cmd run profile:render";
    const warmupFrames = options.warmupFrames ?? RENDER_PROFILE_WARMUP_FRAMES;
    const sampleFrames = options.sampleFrames ?? RENDER_PROFILE_SAMPLE_FRAMES;
    const scenarios = await createRenderProfileScenarios();
    const results = scenarios.map((scenario) =>
        measureScenario(scenario, { warmupFrames, sampleFrames }),
    );
    const summary: RenderProfileSummary = {
        profileVersion: 1,
        commandUsed,
        warmupFrames,
        sampleFrames,
        scenarios: results,
    };

    await mkdir(outputDir, { recursive: true });
    await Promise.all(
        results.map((result) =>
            writeFile(
                join(outputDir, `${result.scenario}.json`),
                `${JSON.stringify(result, null, 2)}\n`,
                "utf8",
            ),
        ),
    );
    await writeFile(
        join(outputDir, "summary.json"),
        `${JSON.stringify(summary, null, 2)}\n`,
        "utf8",
    );
    await writeFile(join(outputDir, "README.md"), createReadme(commandUsed), "utf8");

    return summary;
}
