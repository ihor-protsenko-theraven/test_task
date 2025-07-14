export function initFloorMap<T>(floorCount: number): Map<number, T[]> {
    const map = new Map<number, T[]>();
    for (let i: number = 0; i < floorCount; i++) {
        map.set(i, []);
    }
    return map;
}
