import { describe, expect, it } from "vitest";
import {
    createRenderProfileScenario,
    createRenderProfileScenarios,
    RENDER_PROFILE_SCENARIO_NAMES,
} from "./scenarios";

describe("render profile scenarios", () => {
    it("creates the required scenarios in stable order", () => {
        expect(createRenderProfileScenarios().map((scenario) => scenario.name)).toEqual(
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
});
