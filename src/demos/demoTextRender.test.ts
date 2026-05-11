import { afterEach, describe, expect, it, vi } from "vitest";
import { createFakeCanvas } from "../cluster/engine/services/render/testing/FakeWebGl2.test-utils";
import demoTextRender from "./demoTextRender";
import demoTextRenderSource from "./demoTextRender.ts?raw";

describe("demoTextRender", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("exports a callable text render demo entrypoint", () => {
        expect(demoTextRender).toEqual(expect.any(Function));
    });

    it("runs one frame and reports text renderer metrics", async () => {
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
                if (callbackCount === 1) callback(250);
                return callbackCount;
            }),
        };

        vi.stubGlobal("document", document);
        vi.stubGlobal("window", window);
        vi.stubGlobal("navigator", undefined);

        await demoTextRender();

        expect(app.replaceChildren).toHaveBeenCalledWith(canvas);
        expect(app.appendChild).toHaveBeenCalledWith(metricsPanel);
        expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
        expect(metricsPanel.textContent).toContain("Visible bitmap text");
        expect(metricsPanel.textContent).toContain('"textItemCount": 6');
        expect(metricsPanel.textContent).toContain('"preparedGlyphCount"');
        expect(metricsPanel.textContent).toContain('"textBatchCount"');
        expect(metricsPanel.textContent).toContain('"missingGlyphCount": 1');
    });

    it("documents the required visible text cases without browser raster text", () => {
        expect(demoTextRenderSource).toContain('createLabel("STATIC"');
        expect(demoTextRenderSource).toContain('createLabel("TINT"');
        expect(demoTextRenderSource).toContain('createLabel("OPACITY"');
        expect(demoTextRenderSource).toContain('createLabel("MOVING"');
        expect(demoTextRenderSource).toContain('createLabel("FALLBACK@CASE"');
        expect(demoTextRenderSource).toContain("metricsPanel.textContent");
        expect(demoTextRenderSource).not.toMatch(/fillText|strokeText/);
    });
});
