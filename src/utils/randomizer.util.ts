export function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function randomFloorExcluding(current: number, totalFloors: number): number {
    const options = Array.from({length: totalFloors}, (_, i) => i)
        .filter(targetFloor => targetFloor !== current);

    return options[Math.floor(Math.random() * options.length)];
}






