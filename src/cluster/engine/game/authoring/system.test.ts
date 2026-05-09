import { describe, expect, it } from "vitest";
import { system } from "./system";

describe("system", () => {
    it("defaults authored systems to update", () => {
        const created = system({
            id: "test.system",
            execute() {},
        });

        expect(created.phase).toBe("update");
    });
});
