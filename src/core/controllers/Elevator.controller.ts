import {Application} from 'pixi.js';
import {BuildingView} from '../../renderer/BuildingView';
import {PassengerFlowController} from './PassengerFlow.controller';
import {SpawnerController} from './Spawner.controller';
import {APP_SETTINGS} from '../../config/app-settings.config';
import {Direction} from '../../enums/direction.enum';
import {ElevatorState} from '../../enums/elevator.enum';
import {delay} from '../../utils/timer.util';
import {IBuilding, IElevator, IFloor, IPassenger} from '../../interfaces/interfaces';
import {reverseDirection} from '../../utils/direction.util';
import {getFloorsBetween} from '../../utils/floors.util';

export class ElevatorController {
    private _direction: Direction = Direction.Up;
    private _state: ElevatorState = ElevatorState.Idle;

    constructor(
        private readonly _app: Application,
        private readonly _building: IBuilding,
        private readonly _buildingView: BuildingView,
        private readonly _passengerFlow: PassengerFlowController,
        private readonly _spawner: SpawnerController
    ) {
        this._spawner.onPassengerSpawned = async (passenger: IPassenger): Promise<void> => {
            this._passengerFlow.createPassengerView(passenger);
            await this._onPassengerSpawned();
        };
    }

    public async startSimulation(): Promise<void> {
        this._spawner.startSpawning();
        await this._tryNextMove();
    }

    public stopSimulation(): void {
        this._spawner.stopSpawning();
    }

    private async _onPassengerSpawned(): Promise<void> {
        if (this._state === ElevatorState.Idle) {
            await this._tryNextMove();
        }
    }


    private async _tryNextMove(): Promise<void> {
        if (this._state !== ElevatorState.Idle) return;
        await this._handleCurrentFloor(this._building.elevator.currentFloor);
    }

    private async _planNextMove(): Promise<void> {
        this._state = ElevatorState.Idle;

        const elevator: IElevator = this._building.elevator;
        const currentFloor: number = elevator.currentFloor;

        let nextFloor: number | null = this._getNextFloorInDirection(currentFloor, this._direction);

        if (nextFloor === null) {
            this._direction = reverseDirection(this._direction);

            if (this._hasPendingPickupAt(currentFloor)) {
                await this._handleCurrentFloor(currentFloor);
                return;
            }

            nextFloor = this._getFallbackTarget(currentFloor, elevator);
        }

        if (nextFloor !== null) {
            await this._moveElevatorTo(nextFloor, elevator);
            await this._tryNextMove();
        } else {
            this._state = ElevatorState.Idle;
        }
    }

    private async _handleCurrentFloor(floor: number,): Promise<void> {
        await this._handlePassengerFlow(floor);

        await this._planNextMove();
    }

    private async _handleIntermediateFloor(floor: number): Promise<void> {
        await this._handlePassengerFlow(floor);
        this._state = ElevatorState.Moving;
    }


    private async _moveElevatorTo(target: number, elevator: IElevator): Promise<void> {
        const from: number = elevator.currentFloor;
        if (target === from) return;

        this._state = ElevatorState.Moving;

        const floorsToPass: Generator<number> = getFloorsBetween(from, target);

        for (const floor of floorsToPass) {
            await this._animateElevatorToFloor(floor);
            elevator.currentFloor = floor;

            if (this._shouldStopForPickup(floor, elevator)) {
                console.log(`[Pickup] Stopping at floor ${floor}`);
                await this._handleIntermediateFloor(floor);
            }
        }

        this._state = ElevatorState.Idle;
        console.log(`[Arrived] at floor ${target}`);
    }

    private async _animateElevatorToFloor(floor: number): Promise<void> {
        const duration: number = APP_SETTINGS.ELEVATOR_SPEED_PER_FLOOR_MS;
        await this._buildingView.elevatorView.animateElevatorToFloor(floor, duration);
    }


    private _getNextFloorInDirection(current: number, direction: Direction): number | null {
        const targets: number[] = this._building.elevator.elevatorPassengers
            .map((p: IPassenger): number => p.targetFloor)
            .filter((floor: number): boolean =>
                direction === Direction.Up ? floor > current : floor < current
            );

        if (targets.length > 0) {
            return direction === Direction.Up ? Math.min(...targets) : Math.max(...targets);
        }

        return this._building.findFloorWithWaitingPassengers(current, direction);
    }

    private _getFallbackTarget(current: number, elevator: IElevator): number | null {
        return elevator.hasPassengers
            ? this._getNextFloorInDirection(current, this._direction)
            : this._findClosestWaitingFloor(current);
    }

    private _findClosestWaitingFloor(current: number): number | null {
        let closest: number | null = null;
        let minDistance: number = Infinity;

        this._building.floors.forEach((floor: IFloor, index: number): void => {
            if (!floor.hasWaitingPassengers) return;

            const distance: number = Math.abs(current - index);
            if (distance < minDistance) {
                minDistance = distance;
                closest = index;
            }
        });

        return closest;
    }


    private _shouldStopForPickup(floor: number, elevator: IElevator): boolean {
        const hasFreeSpace: boolean = elevator.elevatorPassengers.length < APP_SETTINGS.ELEVATOR_CAPACITY;
        const hasSameDirection: boolean = this._building.hasWaitingPassengersOnFloor(floor, this._direction);
        return hasFreeSpace && hasSameDirection;
    }

    private _hasPendingPickupAt(floor: number): boolean {
        return this._building.hasWaitingPassengersOnFloor(floor, this._direction);
    }


    private async _handlePassengerFlow(floor: number): Promise<void> {
        const shouldUnload: boolean = this._building.elevator.hasPassengersFor(floor);
        const shouldLoad: boolean = this._building.hasWaitingPassengersOnFloor(floor, this._direction);

        if (shouldUnload) {
            this._state = ElevatorState.Unloading;
            this._passengerFlow.unloadPassengers();
            await delay(APP_SETTINGS.LOADING_TIME);
        }

        if (shouldLoad) {
            this._state = ElevatorState.Loading;
            this._passengerFlow.loadPassengers(floor, this._direction);
            await delay(APP_SETTINGS.LOADING_TIME);
        }
    }

}
