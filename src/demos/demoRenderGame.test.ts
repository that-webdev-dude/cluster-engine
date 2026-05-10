import { describe, expect, it } from "vitest";
import demoRenderGame from "./demoRenderGame";

describe("demoRenderGame", () => {
    it("exports a callable integrated render demo entrypoint", () => {
        expect(demoRenderGame).toEqual(expect.any(Function));
    });
});
