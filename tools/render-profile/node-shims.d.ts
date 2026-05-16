declare module "node:fs/promises" {
    export function mkdir(
        path: string,
        options?: { readonly recursive?: boolean },
    ): Promise<void | string>;

    export function writeFile(
        path: string,
        data: string,
        encoding?: "utf8",
    ): Promise<void>;
}

declare module "node:path" {
    export function join(...paths: readonly string[]): string;
}

declare const process: {
    readonly cwd: () => string;
};
