import {Container, Graphics} from 'pixi.js';
import {ELEVATOR_CONFIG} from '../config/elevator.config';
import {Easing} from '@tweenjs/tween.js';
import {PassengerView} from './PassengerView';
import {PASSENGER_SETTINGS} from "../config/passenger.config";
import {animateMove} from '../utils/animate.util';

export class ElevatorView {
    public elevatorContainer: Container;
    public passengerLayer: Container;
    private readonly _elevatorGraphics: Graphics;
    private readonly _currentFloorY: number;
    private readonly _totalFloors: number;
    private readonly _floorHeight: number;

    constructor(initialFloor: number, totalFloors: number, floorHeight: number) {
        this._totalFloors = totalFloors;
        this._floorHeight = floorHeight;

        this.elevatorContainer = new Container();

        this.passengerLayer = new Container();
        this.elevatorContainer.addChild(this.passengerLayer);

        this._elevatorGraphics = new Graphics();
        this._drawElevatorBody();
        this.elevatorContainer.addChild(this._elevatorGraphics);

        this._currentFloorY = this._getElevatorYFromFloor(initialFloor);
        this.elevatorContainer.x = ELEVATOR_CONFIG.ELEVATOR_X_POSITION;
        this.elevatorContainer.y = this._currentFloorY;
    }

    private _drawElevatorBody(): void {
        this._elevatorGraphics.clear();

        const stubForDoor: number = ELEVATOR_CONFIG.STUB;
        const halfElevatorBorder: number = ELEVATOR_CONFIG.BORDER_WIDTH / 2;

        this._elevatorGraphics.beginFill(ELEVATOR_CONFIG.BACKGROUND_COLOR, ELEVATOR_CONFIG.ALPHA_FILL);
        this._elevatorGraphics.drawRect(0, 0, ELEVATOR_CONFIG.WIDTH, ELEVATOR_CONFIG.HEIGHT);
        this._elevatorGraphics.endFill();

        this._elevatorGraphics.lineStyle(ELEVATOR_CONFIG.BORDER_WIDTH, ELEVATOR_CONFIG.BORDER_COLOR, 1, 0.5);

        this._elevatorGraphics.moveTo(halfElevatorBorder, halfElevatorBorder);
        this._elevatorGraphics.lineTo(halfElevatorBorder, ELEVATOR_CONFIG.HEIGHT - halfElevatorBorder);

        this._elevatorGraphics.moveTo(halfElevatorBorder, halfElevatorBorder);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - halfElevatorBorder, halfElevatorBorder);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - halfElevatorBorder, stubForDoor + halfElevatorBorder);

        this._elevatorGraphics.moveTo(halfElevatorBorder, ELEVATOR_CONFIG.HEIGHT - halfElevatorBorder);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - halfElevatorBorder, ELEVATOR_CONFIG.HEIGHT - halfElevatorBorder);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - halfElevatorBorder, ELEVATOR_CONFIG.HEIGHT - stubForDoor + halfElevatorBorder);
    }

    private _getElevatorYFromFloor(floor: number): number {
        return (this._totalFloors - 1 - floor) * this._floorHeight + ELEVATOR_CONFIG.ELEVATOR_Y_OFFSET;
    }

    public animateElevatorToFloor(targetFloor: number, duration: number): Promise<void> {
        return new Promise((resolve: (value: void | PromiseLike<void>) => void): void => {
            const targetY: number = this._getElevatorYFromFloor(targetFloor);
            animateMove(this.elevatorContainer, this.elevatorContainer.x, targetY, duration, Easing.Linear.None, resolve);
        });
    }

    public repositionPassengers(passengerViews: PassengerView[]): void {
        passengerViews.forEach((view: PassengerView, index: number): void => {
            const targetX: number = 10 + index * (PASSENGER_SETTINGS.PASSENGER_WIDTH + 4);
            const targetY: number = PASSENGER_SETTINGS.PASSENGER_Y_OFFSET;

            view.animateToQueuePosition(targetX, targetY, PASSENGER_SETTINGS.PASSENGER_QUEUE_MOVE_TIME);
        });
    }

}


