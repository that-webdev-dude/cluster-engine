import { afterEach, describe, expect, it, vi } from "vitest";
import { createFakeCanvas } from "../cluster/engine/services/render/testing/FakeWebGl2.test-utils";
import demoLines from "./demoLines";
import demoLinesSource from "./demoLines.ts?raw";

describe("demoLines", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("exports a callable line render demo entrypoint", () => {
        expect(demoLines).toEqual(expect.any(Function));
    });

    it("runs one frame and reports line renderer metrics", async () => {
        const app = {
            replaceChildren: vi.fn(),
            appendChild: vi.fn(),
        };
        const metricsPanel = {
            setAttribute: vi.fn(),
            style: {},
            textContent: "",
        };
        const canvas = createFakeCanvas(null);
        const document = {
            querySelector: vi.fn(() => app),
            createElement: vi.fn((tag: string) =>
                tag === "canvas" ? canvas : metricsPanel,
            ),
        };
        let callbackCount = 0;
        const window = {
            requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
                callbackCount++;
                if (callbackCount === 1) callback(500);
                return callbackCount;
            }),
        };

        vi.stubGlobal("document", document);
        vi.stubGlobal("window", window);
        vi.stubGlobal("navigator", undefined);

        await demoLines();

        expect(app.replaceChildren).toHaveBeenCalledWith(canvas);
        expect(app.appendChild).toHaveBeenCalledWith(metricsPanel);
        expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
        expect(metricsPanel.textContent).toContain("line primitives");
        expect(metricsPanel.textContent).toContain('"lineCount": 180');
        expect(metricsPanel.textContent).toContain('"frameSeq": 1');
    });

    it("authors the visible sketch with render line items", () => {
        expect(demoLinesSource).toContain('kind: "line"');
        expect(demoLinesSource).toContain("startX");
        expect(demoLinesSource).toContain("endX");
        expect(demoLinesSource).toContain("spinSpeed");
        expect(demoLinesSource).toContain("strokeWidth");
    });
});
