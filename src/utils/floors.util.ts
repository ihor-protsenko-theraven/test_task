export function initFloorMap<T>(floorCount: number): Map<number, T[]> {
    const map = new Map<number, T[]>();
    for (let i: number = 0; i < floorCount; i++) {
        map.set(i, []);
    }
    return map;
}

export function* getFloorsBetween(start: number, end: number): Generator<number> {
    const step: number = Math.sign(end - start);
    for (let floor: number = start + step; floor !== end + step; floor += step) {
        yield floor;
    }
}
