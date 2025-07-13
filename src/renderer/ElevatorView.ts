import {Container, Graphics} from 'pixi.js';
import {ELEVATOR_CONFIG} from '../config/elevator.config';
import {Easing, Tween} from "@tweenjs/tween.js";

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

        const stub = 12;
        const half = ELEVATOR_CONFIG.BORDER_WIDTH / 2;

        this._elevatorGraphics.beginFill(ELEVATOR_CONFIG.BACKGROUND_COLOR, ELEVATOR_CONFIG.ALPHA_FILL);
        this._elevatorGraphics.drawRect(0, 0, ELEVATOR_CONFIG.WIDTH, ELEVATOR_CONFIG.HEIGHT);
        this._elevatorGraphics.endFill();

        this._elevatorGraphics.lineStyle(ELEVATOR_CONFIG.BORDER_WIDTH, ELEVATOR_CONFIG.BORDER_COLOR, 1, 0.5);

        this._elevatorGraphics.moveTo(half, half);
        this._elevatorGraphics.lineTo(half, ELEVATOR_CONFIG.HEIGHT - half);

        this._elevatorGraphics.moveTo(half, half);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - half, half);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - half, stub + half);

        this._elevatorGraphics.moveTo(half, ELEVATOR_CONFIG.HEIGHT - half);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - half, ELEVATOR_CONFIG.HEIGHT - half);
        this._elevatorGraphics.lineTo(ELEVATOR_CONFIG.WIDTH - half, ELEVATOR_CONFIG.HEIGHT - stub + half);
    }

    private _getElevatorYFromFloor(floor: number): number {
        return (this._totalFloors - 1 - floor) * this._floorHeight + ELEVATOR_CONFIG.ELEVATOR_Y_OFFSET;
    }

    public animateToFloor(targetFloor: number, duration: number): Promise<void> {
        return new Promise(resolve => {
            const targetY = this._getElevatorYFromFloor(targetFloor);
            new Tween(this.elevatorContainer)
                .to({y: targetY}, duration)
                .easing(Easing.Linear.None)
                .onComplete(() => resolve())
                .start();
        });
    }


}


