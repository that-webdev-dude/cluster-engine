import { describe, expect, it } from "vitest";
import demoTextRender from "./demoTextRender";

describe("demoTextRender", () => {
    it("exports a callable text render demo entrypoint", () => {
        expect(demoTextRender).toEqual(expect.any(Function));
    });
});
