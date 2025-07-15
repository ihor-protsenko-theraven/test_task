import {Passenger} from './Passenger';
import {APP_SETTINGS} from '../../config/app-settings.config';
import {Direction} from '../../enums/direction.enum';
import {IBuilding, IElevator, IFloor} from '../../interfaces/interfaces';
import {Elevator} from "./Elevator";
import {Floor} from "./Floor";

export class Building implements IBuilding {
    public readonly floors: IFloor[];
    public readonly elevator: IElevator;
    private _personIdCounter: number = 0;

    constructor(private readonly floorCount: number,
                private readonly elevatorCapacity: number,
    ) {
        this.floors = this._generateFloors(floorCount);
        this.elevator = new Elevator(elevatorCapacity);
    }

    private _generateFloors(floorCount: number): IFloor[] {
        return Array.from({length: floorCount}, (_, i: number): IFloor => new Floor(i));
    }

    public addPassengerToFloor(floorIndex: number, targetFloor: number): Passenger | null {
        const floor: IFloor = this.floors[floorIndex];
        if (floor.floorQueueLength >= APP_SETTINGS.MAX_PEOPLE_IN_QUEUE) {
            console.warn(`[Spawn] Queue full on floor ${floorIndex}, skip spawning`);
            return null;
        }
        const person = new Passenger(this._personIdCounter++, floorIndex, targetFloor);
        floor.addPassengerToQueue(person);
        return person;
    }

    public hasWaitingPassengersOnFloor(floor: number, direction: Direction): boolean {
        return this.floors[floor].waitingPassengersOnFloor(direction).length > 0;
    }

    public findFloorWithWaitingPassengers(current: number, direction: Direction): number | null {
        const floorRange: number[] = direction === Direction.Up
            ? [...Array(this.floors.length).keys()].slice(current + 1)
            : [...Array(this.floors.length).keys()].slice(0, current).reverse();

        for (const floor of floorRange) {
            if (this.hasWaitingPassengersOnFloor(floor, direction)) {
                return floor;
            }
        }
        return null;
    }


}
