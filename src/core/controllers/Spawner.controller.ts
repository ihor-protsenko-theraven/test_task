import {APP_SETTINGS} from '../../config/app-settings.config';
import {TimeoutMap} from '../../types/types';
import {Building} from '../models/Building';
import {Passenger} from '../models/Passenger';
import {randomBetween, randomFloorExcluding} from '../../utils/randomizer.util';
import {IPassenger} from "../../interfaces/interfaces";

export class SpawnerController {
    private _isSpawning: boolean = false;
    private readonly _timeoutMap: TimeoutMap = new Map();
    private readonly _floorsCount: number;

    constructor(
        private readonly _building: Building,
        private readonly _onPassengerSpawned: (passenger: Passenger) => void
    ) {
        this._floorsCount = APP_SETTINGS.FLOORS_COUNT;
    }

    public startSpawning(): void {

        if (this._isSpawning) {
            return;
        }

        this._isSpawning = true;

        Array.from({length: this._floorsCount}, (_, floor) => this._scheduleSpawnLoop(floor));
    }

    private _scheduleSpawnLoop(floor: number): void {

        if (!this._isSpawning) {
            return;
        }

        const delay: number = randomBetween(
            APP_SETTINGS.PASSENGER_SPAWN_INTERVAL.MIN,
            APP_SETTINGS.PASSENGER_SPAWN_INTERVAL.MAX
        );

        const timeoutId: number = setTimeout(() => {

            if (!this._isSpawning) {
                return;
            }

            const targetFloor: number = randomFloorExcluding(floor, this._floorsCount);
            const passenger: IPassenger | null = this._building.addPassengerToFloor(floor, targetFloor);

            if (passenger) {
                this._onPassengerSpawned(passenger);
            }

            this._scheduleSpawnLoop(floor);
        }, delay);


        this._timeoutMap.set(floor, timeoutId);
    }

    public stopSpawning(): void {
        this._isSpawning = false;
        this._timeoutMap.forEach(timeoutId => clearTimeout(timeoutId));
        this._timeoutMap.clear();
    }

}
