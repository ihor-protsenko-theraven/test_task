export function delay(ms: number): Promise<void> {
    return new Promise((resolve: (value: void | PromiseLike<void>) => void): number => setTimeout(resolve, ms));
}

