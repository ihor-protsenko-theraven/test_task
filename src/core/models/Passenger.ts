import {Direction} from '../../enums/direction.enum';
import {getDirection} from '../../utils/direction.util';
import {IPassenger} from '../../interfaces/interfaces';

export class Passenger implements IPassenger {
    public currentFloor: number;
    public direction: Direction;

    constructor(public readonly id: number,
                currentFloor: number,
                public readonly targetFloor: number) {

        this.currentFloor = currentFloor;
        this.direction = getDirection(currentFloor, targetFloor);
    }
}
