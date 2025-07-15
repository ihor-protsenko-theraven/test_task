import {Container} from 'pixi.js';
import {APP_SETTINGS} from '../../config/app-settings.config';
import {PASSENGER_SETTINGS} from '../../config/passenger.config';
import {ELEVATOR_CONFIG} from '../../config/elevator.config';
import {BUILDING_CONFIG} from '../../config/building.config';
import {Direction} from '../../enums/direction.enum';
import {PassengersQueueMap, PassengerViewMap} from '../../types/types';
import {IBuilding, IElevator, IPassenger} from '../../interfaces/interfaces';
import {BuildingView} from '../../renderer/BuildingView';
import {PassengerView} from '../../renderer/PassengerView';
import {initFloorMap} from '../../utils/floors.util';
import {getQueuePosition} from '../../utils/queue.util';


export class PassengerFlowController {
    private readonly _floorQueuesMap: PassengersQueueMap;
    private readonly _passengerViewsMap: PassengerViewMap = new Map();

    constructor(private readonly _building: IBuilding,
                private readonly _buildingView: BuildingView,) {
        this._floorQueuesMap = initFloorMap<PassengerView>(this._building.floors.length);
    }

    public createPassengerView(passenger: IPassenger): void {
        const floor: number = passenger.currentFloor;
        const passengerQueue: PassengerView[] | undefined = this._floorQueuesMap.get(floor);

        if (!passengerQueue) {
            return;
        }

        const passengerView = new PassengerView(passenger);
        this._buildingView.addPassengerToStage(passengerView)
        this._passengerViewsMap.set(passenger.id, passengerView);
        passengerQueue.push(passengerView);

        this._animateQueue(passengerQueue, floor);

        console.log(`[Spawn] Passenger ${passenger.id} on floor ${floor} → ${passenger.direction} to ${passenger.targetFloor}`);
    }

    public loadPassengers(floor: number, direction: Direction): void {
        const elevator: IElevator = this._building.elevator;
        const passengerQueue: PassengerView[] | undefined = this._floorQueuesMap.get(floor);

        if (!passengerQueue) {
            return;
        }

        const candidates: PassengerView[] = passengerQueue.filter((passenger: PassengerView): boolean => passenger.passenger.direction === direction);
        const freeSlots: number = APP_SETTINGS.ELEVATOR_CAPACITY - elevator.elevatorPassengers.length;
        const toBoard: PassengerView[] = candidates.slice(0, freeSlots);

        for (const passengerView of toBoard) {
            const passenger: IPassenger = passengerView.passenger;

            if (!elevator.boardPassengerToElevator(passenger)) {
                continue;
            }

            console.log(`[Boarded] Passenger ${passenger.id} boarded at floor ${floor}`);
            this._building.floors[floor].removePassengerFromQueue(passenger.id, passenger.direction);
            this._removePassengerFromQueue(floor, passenger.id);

            this._animateEnterPassengerToElevator(passenger.id, this._buildingView.elevatorView.passengerLayer);
        }


        this._animateQueue(passengerQueue, floor);
    }

    public unloadPassengers(): void {
        const exitingPassengers: IPassenger[] = this._building.elevator.disembarkPassengersFromElevator();

        if (!exitingPassengers.length) {
            return;
        }

        for (const passenger of exitingPassengers) {
            this._animateExitPassengerFormElevator(passenger.id);
        }
    }

    private _removePassengerFromQueue(floor: number, passengerID: number): void {
        const passengerQueue: PassengerView[] | undefined = this._floorQueuesMap.get(floor);

        if (!passengerQueue) {
            return;
        }

        const index: number = passengerQueue.findIndex((passengerView: PassengerView): boolean => passengerView.passenger.id === passengerID);
        if (index !== -1) {
            passengerQueue.splice(index, 1);
        }
    }

    private _animateQueue(passengerViews: PassengerView[], floor: number): void {
        passengerViews.forEach((passengerView: PassengerView, idx: number): void => {
            const {targetX, targetY} = getQueuePosition(floor, idx);
            passengerView.animateToQueuePosition(targetX, targetY);
        });
    }

    private _animateEnterPassengerToElevator(passengerId: number, passengerLayer: Container): void {
        const passengerView: PassengerView | undefined = this._passengerViewsMap.get(passengerId);

        if (!passengerView) {
            return;
        }

        passengerView.moveToContainer(passengerLayer);

        const index: number = this._building.elevator.elevatorPassengers.indexOf(passengerView.passenger);
        const targetX: number = 10 + index * (PASSENGER_SETTINGS.PASSENGER_WIDTH + 4);
        const targetY: number = PASSENGER_SETTINGS.PASSENGER_Y_OFFSET;

        passengerView.animateEnterElevator(targetX, targetY, (): void => this._repositionElevatorPassengers());
    }

    private _animateExitPassengerFormElevator(passengerId: number): void {
        const passengerView: PassengerView | undefined = this._passengerViewsMap.get(passengerId);
        if (!passengerView) {
            return;
        }

        const exitX: number = ELEVATOR_CONFIG.ELEVATOR_X_POSITION + ELEVATOR_CONFIG.WIDTH + BUILDING_CONFIG.WIDTH;

        passengerView.animateExitElevator(exitX, (): void => {
            passengerView.passengerContainer.parent?.removeChild(passengerView.passengerContainer);
            this._passengerViewsMap.delete(passengerId);
            this._repositionElevatorPassengers();
        });
    }

    private _repositionElevatorPassengers(): void {
        const passengerViews: PassengerView[] = this._building.elevator.elevatorPassengers
            .map((passenger: IPassenger): PassengerView | undefined => this._passengerViewsMap.get(passenger.id))
            .filter((passengerView: PassengerView | undefined): passengerView is PassengerView => !!passengerView);

        this._buildingView.elevatorView.repositionPassengers(passengerViews);
    }

}
