import {Direction} from '../enums/direction.enum';

export interface IBuilding {
    readonly floors: IFloor[];
    readonly elevator: IElevator;

    addPassengerToFloor(floorIndex: number, targetFloor: number): IPassenger | null;

    hasWaitingPassengersOnFloor(floor: number, direction: Direction): boolean;

    findFloorWithWaitingPassengers(current: number, direction: Direction): number | null;
}

export interface IFloor {
    readonly floorNumber: number;
    readonly floorQueueLength: number;
    readonly hasWaitingPassengers: boolean;

    addPassengerToQueue(passenger: IPassenger): void;

    removePassengerFromQueue(id: number, direction: Direction): void;

    waitingPassengersOnFloor(direction: Direction): IPassenger[];
}

export interface IElevator {
    currentFloor: number;
    direction: Direction;

    readonly hasSpace: boolean;
    readonly hasPassengers: boolean;
    readonly elevatorPassengers: readonly IPassenger[];

    boardPassengerToElevator(passenger: IPassenger): boolean;

    disembarkPassengersFromElevator(): IPassenger[];

    hasPassengersFor(floor: number): boolean;
}

export interface IPassenger {
    readonly id: number;
    currentFloor: number;
    readonly targetFloor: number;
    direction: Direction;
}


