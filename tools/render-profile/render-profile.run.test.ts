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
            ]);
        },
        120_000,
    );
});
