import {Container, Graphics, Text} from 'pixi.js';
import {Passenger} from '../core/models/Passenger';
import {APP_SETTINGS} from '../config/app-settings.config';
import {Direction} from "../enums/direction.enum";
import {PASSENGER_SETTINGS} from "../config/passenger.config";
import {FLOOR_CONFIG} from "../config/floor.config";
import * as TWEEN from "@tweenjs/tween.js";

export class PassengerView {
    public passenger: Passenger;
    public passengerContainer: Container;
    private readonly _passengerGraphics: Graphics;
    private readonly _passengerLabel: Text;

    constructor(passenger1: Passenger) {
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


    public animateToQueuePosition(x: number, y: number): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween(this.passengerContainer)
                .to({x, y, alpha: 1}, PASSENGER_SETTINGS.PASSENGER_MOVE_TIME)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(() => resolve())
                .start();
        });
    }

    public animateEnterElevator(targetX: number, targetY: number): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween(this.passengerContainer)
                .to({x: targetX, y: targetY, alpha: 1}, 800)
                .easing(TWEEN.Easing.Back.Out)
                .onComplete(() => resolve())
                .start();
        });
    }

    public animateExitElevator(exitX: number): Promise<void> {
        return new Promise(resolve => {
            new TWEEN.Tween(this.passengerContainer)
                .to({x: exitX, alpha: 0}, 800)
                .easing(TWEEN.Easing.Back.Out)
                .onComplete(() => resolve())
                .start();
        });
    }

}



