export type DisplayDprModule = Readonly<{
    poll(): { dpr: number; changed: boolean };
}>;

export function createDisplayDpr(args: {
    dpr?: "device" | number;
    window?: Window;
    epsilon?: number;
}): DisplayDprModule {
    const eps = args.epsilon ?? 1e-6;

    let prevDpr: number | undefined;

    const sample = (): number => {
        const dprSource = args.dpr;
        if (dprSource === undefined || dprSource === "device") {
            const deviceDpr = args.window?.devicePixelRatio ?? 1;
            return Number.isFinite(deviceDpr) && deviceDpr > 0 ? deviceDpr : 1;
        }

        return Number.isFinite(dprSource) && dprSource > 0 ? dprSource : 1;
    };

    function poll() {
        const dpr = sample();
        const changed =
            prevDpr === undefined ? true : Math.abs(dpr - prevDpr) > eps;
        prevDpr = dpr;

        return { dpr, changed };
    }

    return Object.freeze({ poll });
}
