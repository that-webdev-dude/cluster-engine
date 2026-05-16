export type TimingSummary = Readonly<{
    min: number;
    median: number;
    p95: number;
    mean: number;
}>;

export function summarizeTimingSeries(values: readonly number[]): TimingSummary {
    if (values.length === 0) {
        return { min: 0, median: 0, p95: 0, mean: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median =
        sorted.length % 2 === 0
            ? (sorted[middle - 1] + sorted[middle]) / 2
            : sorted[middle];
    const p95Index = Math.min(
        sorted.length - 1,
        Math.max(0, Math.ceil(sorted.length * 0.95) - 1),
    );
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    return {
        min: sorted[0],
        median,
        p95: sorted[p95Index],
        mean,
    };
}
