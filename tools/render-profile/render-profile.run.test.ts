import { describe, expect, it } from "vitest";
import { runRenderProfile } from "./run-profile";

describe("render profile runner", () => {
    it(
        "writes current render profile artifacts",
        async () => {
            const summary = await runRenderProfile({
                commandUsed: "npm.cmd run profile:render",
            });

            expect(summary.scenarios.map((scenario) => scenario.scenario)).toEqual([
                "rects-10k",
                "sprites-10k",
                "circles-5k",
                "lines-10k",
                "polygons-5k",
                "mixed-10k",
                "world-rects-1k",
                "world-rects-10k",
            ]);

            for (const scenario of summary.scenarios) {
                expect(scenario.extractOnlyMs).toBeDefined();
                expect(scenario.publishOnlyMs).toBeDefined();
                expect(scenario.prepareRenderFullMs).toBeDefined();
                expect(scenario.frameTotalMs.median).toBeGreaterThanOrEqual(
                    scenario.prepareMs.median,
                );
            }
        },
        600_000,
    );
});
