import { describe, expect, it } from "vitest";
import { summarizeTimingSeries } from "./summary";

describe("summarizeTimingSeries", () => {
    it("returns zero summaries for empty series", () => {
        expect(summarizeTimingSeries([])).toEqual({
            min: 0,
            median: 0,
            p95: 0,
            mean: 0,
        });
    });

    it("summarizes unsorted odd-length series", () => {
        expect(summarizeTimingSeries([5, 1, 9, 3, 7])).toEqual({
            min: 1,
            median: 5,
            p95: 9,
            mean: 5,
        });
    });

    it("averages even-length medians and uses nearest-rank p95", () => {
        expect(summarizeTimingSeries([4, 1, 2, 3])).toEqual({
            min: 1,
            median: 2.5,
            p95: 4,
            mean: 2.5,
        });
    });
});
