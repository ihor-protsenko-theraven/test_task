import {Container} from 'pixi.js';
import {Easing} from "@tweenjs/tween.js";
import {APP_SETTINGS} from '../../config/app-settings.config';
import {PASSENGER_SETTINGS} from '../../config/passenger.config';
import {ELEVATOR_CONFIG} from '../../config/elevator.config';
import {BUILDING_CONFIG} from '../../config/building.config';
import {Direction} from '../../enums/direction.enum';
import {PassengersQueueMap, PassengerViewMap} from '../../types/types';
import {IElevator, IPassenger} from '../../interfaces/interfaces';
import {Building} from '../models/Building';
import {BuildingView} from '../../renderer/BuildingView';
import {PassengerView} from '../../renderer/PassengerView';
import {initFloorMap} from '../../utils/floor-map.util';
import {getQueuePosition} from '../../utils/queue.util';
import {animateMove} from "../../utils/animate.util";


export class PassengerFlowController {
    private readonly _floorQueuesMap: PassengersQueueMap;
    private readonly _passengerViewsMap: PassengerViewMap = new Map();

    constructor(private readonly _building: Building,
                private readonly _buildingView: BuildingView,) {
        this._floorQueuesMap = initFloorMap<PassengerView>(this._building.floors.length);
    }

    public createPassengerView(passenger: IPassenger): void {
        const floor = passenger.currentFloor;
        const queue = this._floorQueuesMap.get(floor);

        if (!queue) {
            return;
        }

        const passengerView = new PassengerView(passenger);
        this._buildingView.addPassengerToStage(passengerView)
        this._passengerViewsMap.set(passenger.id, passengerView);
        queue.push(passengerView);

        this._animateQueue(queue, floor);

        console.log(`[Spawn] Passenger ${passenger.id} on floor ${floor} → ${passenger.direction} to ${passenger.targetFloor}`);
    }

    public loadPassengers(floor: number, direction: Direction): void {
        const elevator: IElevator = this._building.elevator;
        const passengerQueue = this._floorQueuesMap.get(floor);

        if (!passengerQueue) {
            return;
        }

        const candidates = passengerQueue.filter(v => v.passenger.direction === direction);
        const freeSlots = APP_SETTINGS.ELEVATOR_CAPACITY - elevator.elevatorPassengers.length;
        const toBoard = candidates.slice(0, freeSlots);

        for (const passengerView of toBoard) {
            const passenger: IPassenger = passengerView.passenger;

            if (!elevator.boardPassengerToElevator(passenger)) {
                continue;
            }

            console.log(`[Boarded] Passenger ${passenger.id} boarded at floor ${floor}`);
            this._building.floors[floor].removePassengerFromQueue(passenger.id, passenger.direction);
            this._removePassengerFromQueue(floor, passenger.id);

            this._animateEnterElevator(passenger.id, this._buildingView.elevatorView.passengerLayer);
        }


        this._animateQueue(passengerQueue, floor);
    }

    public unloadPassengers(): void {
        const exitingPassengers: IPassenger[] = this._building.elevator.disembarkPassengersFromElevator();

        if (!exitingPassengers.length) {
            return;
        }

        for (const passenger of exitingPassengers) {
            this._animateExitElevator(passenger.id);
        }
    }

    private _removePassengerFromQueue(floor: number, passengerID: number): void {
        const queue = this._floorQueuesMap.get(floor);

        if (!queue) {
            return;
        }

        const index = queue.findIndex(view => view.passenger.id === passengerID);
        if (index !== -1) {
            queue.splice(index, 1);
        }
    }

    //ToDo:Move animate to correct place
    private _animateQueue(passengerViews: PassengerView[], floor: number): void {
        passengerViews.forEach((view, idx) => {
            const {x, y} = getQueuePosition(floor, idx);
            animateMove(view.passengerContainer,
                x,
                y,
                PASSENGER_SETTINGS.PASSENGER_MOVE_TIME,
                Easing.Quadratic.Out
            );
        });
    }

    private _animateEnterElevator(passengerId: number, passengerLayer: Container): void {
        const passengerView: PassengerView | undefined = this._passengerViewsMap.get(passengerId);

        if (!passengerView) {
            return;
        }

        if (passengerView.passengerContainer.parent) {
            passengerView.passengerContainer.parent.removeChild(passengerView.passengerContainer);
        }
        passengerLayer.addChild(passengerView.passengerContainer);

        // ToDo: remove magic numbers
        passengerView.passengerContainer.x = -10;
        passengerView.passengerContainer.y = (ELEVATOR_CONFIG.HEIGHT - PASSENGER_SETTINGS.PASSENGER_HEIGHT) / 2;

        const index = this._building.elevator.elevatorPassengers.indexOf(passengerView.passenger);
        const targetX = 10 + index * (PASSENGER_SETTINGS.PASSENGER_WIDTH + 4);

        animateMove(
            passengerView.passengerContainer,
            targetX,
            passengerView.passengerContainer.y,
            PASSENGER_SETTINGS.PASSENGER_MOVE_TIME,
            Easing.Back.Out,
            () => this._repositionElevatorPassengers()
        );
    }

    private _animateExitElevator(passengerId: number): void {
        const passengerView: PassengerView | undefined = this._passengerViewsMap.get(passengerId);

        if (!passengerView) {
            return;
        }

        const exitX: number =
            ELEVATOR_CONFIG.ELEVATOR_X_POSITION +
            ELEVATOR_CONFIG.WIDTH +
            BUILDING_CONFIG.WIDTH;

        animateMove(
            passengerView.passengerContainer,
            exitX,
            passengerView.passengerContainer.y,
            PASSENGER_SETTINGS.PASSENGER_EXIT_TIME,
            Easing.Back.Out,
            () => {
                if (passengerView.passengerContainer.parent) {
                    passengerView.passengerContainer.parent.removeChild(passengerView.passengerContainer);
                }
                this._passengerViewsMap.delete(passengerId);
                this._repositionElevatorPassengers();
            }
        );
    }

    private _repositionElevatorPassengers(): void {
        this._building.elevator.elevatorPassengers.forEach((passenger, index) => {
            const passengerView: PassengerView | undefined = this._passengerViewsMap.get(passenger.id);

            if (!passengerView) {
                return;
            }

            const targetX = 10 + index * (PASSENGER_SETTINGS.PASSENGER_WIDTH + 4);
            const targetY = (ELEVATOR_CONFIG.HEIGHT - PASSENGER_SETTINGS.PASSENGER_HEIGHT) / 2;

            animateMove(
                passengerView.passengerContainer,
                targetX,
                targetY,
                PASSENGER_SETTINGS.PASSENGER_QUEUE_MOVE_TIME,
                Easing.Quadratic.Out
            );
        });
    }

}
