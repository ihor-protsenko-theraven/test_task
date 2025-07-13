import {Floor} from './Floor';
import {Passenger} from './Passenger';
import {Elevator} from './Elevator';
import {APP_SETTINGS} from '../../config/app-settings.config';
import {Direction} from '../../enums/direction.enum';
import {IBuilding, IFloor} from '../../interfaces/interfaces';

export class Building implements IBuilding {
    public readonly floors: IFloor[];
    public readonly elevator: Elevator;
    private _personIdCounter = 0;

    constructor(floorCount: number, elevatorCapacity: number) {
        this.floors = Array.from({length: floorCount}, (_, i) => new Floor(i));
        this.elevator = new Elevator(elevatorCapacity);
    }

    public addPassengerToFloor(floorIndex: number, targetFloor: number): Passenger | null {
        const floor = this.floors[floorIndex];
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
        const floorRange = direction === Direction.Up
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
