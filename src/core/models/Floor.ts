import {Direction} from '../../enums/direction.enum';
import {IFloor, IPassenger} from '../../interfaces/interfaces';

export class Floor implements IFloor {
    public readonly floorNumber: number;
    public waitingUp: IPassenger[] = [];
    public waitingDown: IPassenger[] = [];

    constructor(floorNumber: number) {
        this.floorNumber = floorNumber;
    }

    public get floorQueueLength(): number {
        return this.waitingUp.length + this.waitingDown.length;
    }

    public get hasWaitingPassengers(): boolean {
        return this.floorQueueLength > 0;
    }

    public addPassengerToQueue(passenger: IPassenger): void {
        if (passenger.direction === Direction.Up) {
            this.waitingUp.push(passenger);
            return;
        }
        this.waitingDown.push(passenger);
    }

    public removePassengerFromQueue(id: number, direction: Direction): void {
        const passengers: IPassenger[] = direction === Direction.Up ? this.waitingUp : this.waitingDown;
        const passengerIndex: number = passengers.findIndex((passenger: IPassenger): boolean => passenger.id === id);

        if (passengerIndex !== -1) {
            passengers.splice(passengerIndex, 1);
        }
    }

    public waitingPassengersOnFloor(direction: Direction): IPassenger[] {

        if (!this.hasWaitingPassengers) {
            return [];
        }

        if (direction === Direction.Down) {
            return this.waitingDown;
        }

        return this.waitingUp;
    }
}
