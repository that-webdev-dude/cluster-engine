import { describe, expect, it } from "vitest";
import {
    createRenderProfileScenario,
    createRenderProfileScenarios,
    RENDER_PROFILE_SCENARIO_NAMES,
} from "./scenarios";

describe("render profile scenarios", () => {
    it("creates the required scenarios in stable order", async () => {
        const scenarios = await createRenderProfileScenarios();

        expect(scenarios.map((scenario) => scenario.name)).toEqual(
            RENDER_PROFILE_SCENARIO_NAMES,
        );
    });

    it("uses deterministic generated input", () => {
        const first = createRenderProfileScenario("mixed-10k");
        const second = createRenderProfileScenario("mixed-10k");

        expect(first).toEqual(second);
        expect(first.itemCount).toBe(10_000);
        expect(first.input.layers).toHaveLength(1);
        expect(first.input.layers[0].items).toHaveLength(10_000);
    });

    it("generates expected item counts per scenario", () => {
        expect(createRenderProfileScenario("rects-10k").itemCount).toBe(10_000);
        expect(createRenderProfileScenario("sprites-10k").itemCount).toBe(10_000);
        expect(createRenderProfileScenario("circles-5k").itemCount).toBe(5_000);
        expect(createRenderProfileScenario("lines-10k").itemCount).toBe(10_000);
        expect(createRenderProfileScenario("polygons-5k").itemCount).toBe(5_000);
        expect(createRenderProfileScenario("mixed-10k").itemCount).toBe(10_000);
    });

    it("can create only renderer scenarios for focused renderer comparison", async () => {
        const scenarios = await createRenderProfileScenarios({
            includeWorldBacked: false,
        });

        expect(scenarios.map((scenario) => scenario.source)).toEqual([
            "renderer-only",
            "renderer-only",
            "renderer-only",
            "renderer-only",
            "renderer-only",
            "renderer-only",
        ]);
    });

    it("creates world-backed scenarios that extract from real world storage", async () => {
        const scenarios = await createRenderProfileScenarios();
        const scenario = scenarios.find(
            (candidate) => candidate.name === "world-rects-1k",
        );

        expect(scenario?.source).toBe("world-backed");
        if (!scenario || scenario.source !== "world-backed") {
            throw new Error("expected world-backed scenario");
        }

        const input = scenario.extract();

        expect(input.layers).toHaveLength(1);
        expect(input.layers[0].items).toHaveLength(1_000);
        expect(input.layers[0].items[0]).toMatchObject({
            kind: "rect",
            sortKey: 0,
            x: -1000,
            y: -650,
            prevX: -1000.5,
            prevY: -650.25,
            w: 7,
            h: 9,
        });
    });
});
