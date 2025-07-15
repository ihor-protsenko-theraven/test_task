import {APP_SETTINGS} from '../config/app-settings.config';
import {ELEVATOR_CONFIG} from '../config/elevator.config';
import {FLOOR_CONFIG} from '../config/floor.config';
import {BUILDING_CONFIG} from '../config/building.config';
import {Container, Graphics, Text} from "pixi.js";

export class FloorView {
    public readonly floorNumber: number;
    public readonly container: Container;
    private readonly _corridorLine: Graphics = new Graphics();
    private readonly _floorLine: Graphics = new Graphics();
    private readonly _floorLabel: Text;

    constructor(floorNumber: number) {
        this.floorNumber = floorNumber;
        this.container = new Container();

        const offset_Y: number = (APP_SETTINGS.FLOORS_COUNT - 1 - floorNumber) * FLOOR_CONFIG.HEIGHT;
        this.container.position.set(0, offset_Y);

        this._corridorLine.lineStyle(FLOOR_CONFIG.LINE.THICKNESS, FLOOR_CONFIG.LINE.COLOR);
        const corridorStartX: number = ELEVATOR_CONFIG.WIDTH + FLOOR_CONFIG.LINE.CORRIDOR_OFFSET_X;
        this._corridorLine.moveTo(corridorStartX, 0);
        this._corridorLine.lineTo(BUILDING_CONFIG.WIDTH, 0);
        this.container.addChild(this._corridorLine);

        this._floorLine.lineStyle(FLOOR_CONFIG.LINE.THICKNESS, FLOOR_CONFIG.LINE.COLOR);
        const floorStartX: number = corridorStartX;
        const floorY: number = FLOOR_CONFIG.HEIGHT;
        this._floorLine.moveTo(floorStartX, floorY);
        this._floorLine.lineTo(BUILDING_CONFIG.WIDTH, floorY);
        this.container.addChild(this._floorLine);

        this._floorLabel = new Text(`Level ${floorNumber + 1}`, {
            fontSize: FLOOR_CONFIG.LABEL.FONT_SIZE,
            fill: FLOOR_CONFIG.LABEL.COLOR
        });
        this._floorLabel.anchor.set(
            FLOOR_CONFIG.LABEL.ANCHOR_X,
            FLOOR_CONFIG.LABEL.ANCHOR_Y
        );
        this._floorLabel.position.set(
            BUILDING_CONFIG.WIDTH - FLOOR_CONFIG.LABEL.OFFSET_FROM_RIGHT,
            FLOOR_CONFIG.LABEL.OFFSET_Y
        );
        this.container.addChild(this._floorLabel);
    }
}


