export function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function randomFloorExcluding(current: number, totalFloors: number): number {
    const options: number[] = Array.from({length: totalFloors}, (_: undefined, i: number): number => i)
        .filter((targetFloor: number): boolean => targetFloor !== current);

    return options[Math.floor(Math.random() * options.length)];
}






