import {Application} from 'pixi.js';
import {BuildingView} from '../../renderer/BuildingView';
import {PassengerFlowController} from './PassengerFlow.controller';
import {SpawnerController} from './Spawner.controller';
import {APP_SETTINGS} from '../../config/app-settings.config';
import {Direction} from '../../enums/direction.enum';
import {ElevatorState} from '../../enums/elevator.enum';
import {delay} from '../../utils/timer.util';
import {reverseDirection} from '../../utils/direction.util';
import {IBuilding, IElevator, IPassenger} from '../../interfaces/interfaces';


export class ElevatorController {
    private _direction: Direction = Direction.Up;
    private _elevatorState: ElevatorState = ElevatorState.Idle;

    constructor(private readonly _app: Application,
                private readonly _building: IBuilding,
                private readonly _buildingView: BuildingView,
                private readonly _passengerFlowController: PassengerFlowController,
                private readonly _spawnerController: SpawnerController
    ) {
        this._spawnerController.onPassengerSpawned = async (passenger: IPassenger): Promise<void> => {
            this._passengerFlowController.createPassengerView(passenger);
            await this._onPassengerAppeared();
        };
    }

    public start(): void {
        this._spawnerController.startSpawning();
        this._scheduleNextMove();
    }

    private async _scheduleNextMove(): Promise<void> {
        if (this._elevatorState !== ElevatorState.Idle) {
            return;
        }

        await this._processFloor();
    }

    private async _processFloor(): Promise<void> {
        const currentFloor = this._building.elevator.currentFloor;
        const shouldLoad = this._building.hasWaitingPassengersOnFloor(currentFloor, this._direction);
        const shouldUnLoad = this._building.elevator.hasPassengersFor(currentFloor);

        if (shouldUnLoad) {
            this._elevatorState = ElevatorState.Unloading;
            this._passengerFlowController.unloadPassengers();

            await delay(APP_SETTINGS.LOADING_TIME);
        }

        if (shouldLoad) {
            this._elevatorState = ElevatorState.Loading;
            this._passengerFlowController.loadPassengers(currentFloor, this._direction);

            await delay(APP_SETTINGS.LOADING_TIME);
        }

        await this._decideNextMovement();
    }

    private async _decideNextMovement(): Promise<void> {
        this._elevatorState = ElevatorState.Idle;
        const elevator = this._building.elevator;
        const currentFloor = elevator.currentFloor;

        let nextTarget = this._findNextTargetInDirection(currentFloor, this._direction);

        if (nextTarget === null) {
            this._direction = reverseDirection(this._direction);

            if (this._building.hasWaitingPassengersOnFloor(currentFloor, this._direction)) {
                await this._processFloor();
                return;
            }

            nextTarget = elevator.hasPassengers
                ? this._findNextTargetInDirection(currentFloor, this._direction)
                : this._findNextGlobalTargetFloor(currentFloor);
        }

        if (nextTarget !== null) {
            await this._moveElevatorToFloor(nextTarget);
            await this._scheduleNextMove();
            return;
        }

        this._elevatorState = ElevatorState.Idle;
    }

    private async _moveElevatorToFloor(target: number): Promise<void> {
        const elevator: IElevator = this._building.elevator;
        const duration: number = APP_SETTINGS.ELEVATOR_SPEED_PER_FLOOR_MS * Math.abs(elevator.currentFloor - target);
        this._elevatorState = ElevatorState.Moving;
        console.log(`[Move]  from ${elevator.currentFloor} to ${target}. Direction: ${this._direction}`);

        await this._buildingView.elevatorView.animateElevatorToFloor(target, duration);

        elevator.currentFloor = target;
        this._elevatorState = ElevatorState.Idle;
        console.log(`[Arrived] at floor ${target}.`);
    }

    private _findNextTargetInDirection(current: number, direction: Direction): number | null {
        const targetFloors: number[] = this._building.elevator.elevatorPassengers
            .map((passenger: IPassenger): number => passenger.targetFloor)
            .filter((floor: number): boolean => direction === Direction.Up ? floor > current : floor < current);

        if (targetFloors.length > 0) {
            return direction === Direction.Up
                ? Math.min(...targetFloors)
                : Math.max(...targetFloors);
        }

        return this._building.findFloorWithWaitingPassengers(current, direction);
    }

    private _findNextGlobalTargetFloor(current: number): number | null {
        let minDistance: number = Infinity;
        let closestFloor: number | null = null;

        this._building.floors.forEach((floor, i) => {

            if (!floor.hasWaitingPassengers) {
                return;
            }

            const dist: number = Math.abs(current - i);
            if (dist < minDistance) {
                minDistance = dist;
                closestFloor = i;
            }
        });

        return closestFloor;
    }

    private async _onPassengerAppeared(): Promise<void> {
        if (this._elevatorState === ElevatorState.Idle) {
            await this._scheduleNextMove();
        }
    }

    public stopPassengerSpawning(): void {
        this._spawnerController.stopSpawning();
    }

}
