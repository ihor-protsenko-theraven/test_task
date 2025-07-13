import {Direction} from "../enums/direction.enum";

export function reverseDirection(dir: Direction): Direction {
    return dir === Direction.Up ? Direction.Down : Direction.Up;
}

export function getDirection(from: number, to: number): Direction {
    return to > from ? Direction.Up : Direction.Down;
}
