import {Direction} from '../../enums/direction.enum';
import {IElevator, IPassenger} from '../../interfaces/interfaces';

export class Elevator implements IElevator {
    private readonly _capacity: number;
    private _elevatorPassengers: IPassenger[] = [];
    public currentFloor: number = 0;
    public direction: Direction = Direction.Up;

    constructor(capacity: number, startFloor: number = 0, startDirection: Direction = Direction.Up) {
        this._capacity = capacity;
        this.currentFloor = startFloor;
        this.direction = startDirection;
    }

    public get hasFreeSpace(): boolean {
        return this._elevatorPassengers.length < this._capacity;
    }

    public get hasPassengers(): boolean {
        return this._elevatorPassengers.length > 0;
    }

    public get elevatorPassengers(): readonly IPassenger[] {
        return this._elevatorPassengers;
    }

    public boardPassengerToElevator(passenger: IPassenger): boolean {
        if (!this.hasFreeSpace) {
            return false;
        }
        this._elevatorPassengers.push(passenger);
        return true;
    }

    public disembarkPassengersFromElevator(): IPassenger[] {
        const exiting: IPassenger[] = this._elevatorPassengers.filter(p => p.targetFloor === this.currentFloor);
        this._elevatorPassengers = this._elevatorPassengers.filter(p => p.targetFloor !== this.currentFloor);
        return exiting;
    }

    public hasPassengersFor(floor: number): boolean {
        return this._elevatorPassengers.some(p => p.targetFloor === floor);
    }

}
