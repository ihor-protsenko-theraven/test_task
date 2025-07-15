import {Container, Graphics, Point, Text} from 'pixi.js';
import {APP_SETTINGS} from '../config/app-settings.config';
import {Direction} from '../enums/direction.enum';
import {PASSENGER_SETTINGS} from "../config/passenger.config";
import {FLOOR_CONFIG} from '../config/floor.config';
import {Easing} from '@tweenjs/tween.js';
import {animateMove} from '../utils/animate.util';
import {IPassenger} from "../interfaces/interfaces";

export class PassengerView {
    public passenger: IPassenger;
    public passengerContainer: Container;
    private readonly _passengerGraphics: Graphics;
    private readonly _passengerLabel: Text;

    constructor(passenger1: IPassenger) {
        this.passenger = passenger1;
        this.passengerContainer = new Container();

        this._passengerGraphics = new Graphics();
        this._drawPassengerBody();
        this.passengerContainer.addChild(this._passengerGraphics);

        this._passengerLabel = new Text(`${passenger1.targetFloor + 1}`, {
            fontSize: PASSENGER_SETTINGS.LABEL_FONT_SIZE,
            fill: PASSENGER_SETTINGS.LABEL_COLOR,
        });

        this._passengerLabel.anchor.set(0.5);
        this._passengerLabel.position.set(PASSENGER_SETTINGS.LABEL_OFFSET_X, PASSENGER_SETTINGS.LABEL_OFFSET_Y);
        this.passengerContainer.addChild(this._passengerLabel);

        this._setStartPosition();
    }

    private _drawPassengerBody(): void {
        this._passengerGraphics.clear();

        const color: number = this.passenger.direction === Direction.Up
            ? PASSENGER_SETTINGS.COLOR_UP
            : PASSENGER_SETTINGS.COLOR_DOWN;

        this._passengerGraphics.lineStyle(PASSENGER_SETTINGS.BORDER_WIDTH, color);
        this._passengerGraphics.beginFill(PASSENGER_SETTINGS.BACKGROUND_COLOR, PASSENGER_SETTINGS.ALPHA_FILL);
        this._passengerGraphics.drawRoundedRect(0, 0, PASSENGER_SETTINGS.PASSENGER_WIDTH, PASSENGER_SETTINGS.PASSENGER_HEIGHT, PASSENGER_SETTINGS.PASSENGER_RADIUS);
        this._passengerGraphics.endFill();
    }

    private _setStartPosition(): void {
        const y: number = this._getYFromFloor(this.passenger.currentFloor);
        this.passengerContainer.x = PASSENGER_SETTINGS.PASSENGER_START_X;
        this.passengerContainer.y = y + PASSENGER_SETTINGS.PASSENGER_Y_OFFSET;
    }

    private _getYFromFloor(floor: number): number {
        const totalFloors: number = APP_SETTINGS.FLOORS_COUNT;
        return (totalFloors - 1 - floor) * FLOOR_CONFIG.HEIGHT;
    }

    public animateToQueuePosition(targetX: number,
                                  targetY: number,
                                  animationDuration: number = PASSENGER_SETTINGS.PASSENGER_MOVE_TIME
    ): void {
        animateMove(this.passengerContainer, targetX, targetY, animationDuration, Easing.Quadratic.Out);
    }


    public animateEnterElevator(targetXInsideElevator: number,
                                targetYInsideElevator: number,
                                onComplete?: () => void
    ): void {
        animateMove(this.passengerContainer, targetXInsideElevator, targetYInsideElevator, PASSENGER_SETTINGS.PASSENGER_MOVE_TIME, Easing.Back.Out, onComplete);
    }


    public animateExitElevator(exitX: number, onComplete: () => void): void {
        return animateMove(this.passengerContainer, exitX, this.passengerContainer.y, PASSENGER_SETTINGS.PASSENGER_EXIT_TIME, Easing.Back.Out, onComplete);
    }

    public moveToContainer(newParent: Container): void {
        const global: Point = this.passengerContainer.getGlobalPosition();
        this.passengerContainer.parent?.removeChild(this.passengerContainer);

        newParent.addChild(this.passengerContainer);

        const local: Point = newParent.toLocal(global);
        this.passengerContainer.position.set(local.x, local.y);
    }


}



